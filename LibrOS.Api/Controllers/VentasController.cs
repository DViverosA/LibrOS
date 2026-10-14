using LibrOS.Api.Data;
using LibrOS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibrOS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VentasController : ControllerBase
{
    private readonly AppDbContext _context;

    public VentasController(AppDbContext context)
    {
        _context = context;
    }

    private IQueryable<VentaDto> ProyectarVentas(IQueryable<Venta> query) =>
        query.Select(v => new VentaDto(
            v.Id,
            v.Fecha,
            v.Vendedor,
            v.Total,
            v.Detalles.Select(d => new VentaDetalleDto(
                d.LibroId,
                d.Libro!.Titulo,
                d.Cantidad,
                d.PrecioUnitario,
                d.Subtotal)).ToList()));

    // GET: api/ventas  (historial, más reciente primero)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<VentaDto>>> GetVentas()
    {
        var ventas = await ProyectarVentas(
                _context.Ventas.AsNoTracking().OrderByDescending(v => v.Fecha))
            .ToListAsync();

        return Ok(ventas);
    }

    // GET: api/ventas/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<VentaDto>> GetVenta(int id)
    {
        var venta = await ProyectarVentas(
                _context.Ventas.AsNoTracking().Where(v => v.Id == id))
            .FirstOrDefaultAsync();

        if (venta is null) return NotFound();
        return Ok(venta);
    }

    // POST: api/ventas
    [HttpPost]
    public async Task<ActionResult<VentaDto>> PostVenta(VentaCreateDto dto)
    {
        // Si el mismo libro viene repetido, se suman las cantidades
        var items = dto.Items
            .GroupBy(i => i.LibroId)
            .Select(g => new { LibroId = g.Key, Cantidad = g.Sum(i => i.Cantidad) })
            .ToList();

        var ids = items.Select(i => i.LibroId).ToList();
        var libros = await _context.Libros
            .AsNoTracking()
            .Where(l => ids.Contains(l.Id))
            .ToDictionaryAsync(l => l.Id);

        var venta = new Venta { Vendedor = dto.Vendedor.Trim(), Fecha = DateTime.Now };

        foreach (var item in items)
        {
            if (!libros.TryGetValue(item.LibroId, out var libro))
                return BadRequest($"No existe un libro con Id {item.LibroId}.");

            if (libro.Precio <= 0)
                return BadRequest($"El libro \"{libro.Titulo}\" no tiene un precio válido (mayor a 0); defínelo antes de venderlo.");

            if (item.Cantidad > libro.Cantidad)
                return Conflict($"Stock insuficiente de \"{libro.Titulo}\": disponibles {libro.Cantidad}, solicitados {item.Cantidad}.");

            venta.Detalles.Add(new VentaDetalle
            {
                LibroId = libro.Id,
                Cantidad = item.Cantidad,
                PrecioUnitario = libro.Precio,
                Subtotal = libro.Precio * item.Cantidad
            });
        }

        venta.Total = venta.Detalles.Sum(d => d.Subtotal);

        await using var tx = await _context.Database.BeginTransactionAsync();

        // Descuento atómico: solo resta si todavía hay stock suficiente (protege contra ventas simultáneas)
        foreach (var d in venta.Detalles)
        {
            var cantidad = d.Cantidad;
            var filas = await _context.Libros
                .Where(l => l.Id == d.LibroId && l.Cantidad >= cantidad)
                .ExecuteUpdateAsync(s => s.SetProperty(l => l.Cantidad, l => l.Cantidad - cantidad));

            if (filas == 0)
            {
                await tx.RollbackAsync();
                return Conflict($"Stock insuficiente de \"{libros[d.LibroId].Titulo}\"; el inventario cambió mientras se procesaba la venta.");
            }
        }

        _context.Ventas.Add(venta);
        await _context.SaveChangesAsync();
        await tx.CommitAsync();

        var resultado = await ProyectarVentas(
                _context.Ventas.AsNoTracking().Where(v => v.Id == venta.Id))
            .FirstAsync();

        return CreatedAtAction(nameof(GetVenta), new { id = venta.Id }, resultado);
    }
}