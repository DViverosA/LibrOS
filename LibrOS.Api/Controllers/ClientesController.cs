using System.Linq.Expressions;
using LibrOS.Api.Data;
using LibrOS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibrOS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ClientesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ClientesController(AppDbContext context)
    {
        _context = context;
    }

    private static readonly Expression<Func<Cliente, ClienteDto>> ADto =
        c => new ClienteDto(c.Id, c.Nombre, c.Telefono, c.Email, c.FechaRegistro);

    // GET: api/clientes?buscar=texto
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ClienteDto>>> GetClientes([FromQuery] string? buscar)
    {
        var query = _context.Clientes.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(buscar))
        {
            var t = buscar.Trim();
            query = query.Where(c =>
                c.Nombre.Contains(t) ||
                (c.Telefono != null && c.Telefono.Contains(t)) ||
                (c.Email != null && c.Email.Contains(t)));
        }

        return Ok(await query.OrderBy(c => c.Nombre).Select(ADto).ToListAsync());
    }

    // GET: api/clientes/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ClienteDto>> GetCliente(int id)
    {
        var cliente = await _context.Clientes.AsNoTracking()
            .Where(c => c.Id == id).Select(ADto).FirstOrDefaultAsync();

        if (cliente is null) return NotFound();
        return Ok(cliente);
    }

    // GET: api/clientes/5/historial  (compras del cliente, más reciente primero)
    [HttpGet("{id:int}/historial")]
    public async Task<ActionResult<ClienteHistorialDto>> GetHistorial(int id)
    {
        var cliente = await _context.Clientes.AsNoTracking()
            .Where(c => c.Id == id).Select(ADto).FirstOrDefaultAsync();
        if (cliente is null) return NotFound();

        var ventas = await _context.Ventas.AsNoTracking()
            .Where(v => v.ClienteId == id)
            .OrderByDescending(v => v.Fecha)
            .Select(v => new VentaDto(
                v.Id, v.Fecha, v.Vendedor, v.Total, v.ClienteId, v.Cliente!.Nombre,
                v.Detalles.Select(d => new VentaDetalleDto(
                    d.LibroId, d.Libro!.Titulo, d.Cantidad, d.PrecioUnitario, d.Subtotal)).ToList()))
            .ToListAsync();

        return Ok(new ClienteHistorialDto(cliente, ventas.Count, ventas.Sum(v => v.Total), ventas));
    }

    // POST: api/clientes
    [HttpPost]
    public async Task<ActionResult<ClienteDto>> PostCliente(ClienteCreateDto dto)
    {
        var error = await Validar(dto, null);
        if (error is not null) return error;

        var cliente = new Cliente
        {
            Nombre = dto.Nombre.Trim(),
            Telefono = dto.Telefono.Trim(),
            Email = dto.Email.Trim()
        };

        _context.Clientes.Add(cliente);
        await _context.SaveChangesAsync();

        var resultado = new ClienteDto(cliente.Id, cliente.Nombre, cliente.Telefono, cliente.Email, cliente.FechaRegistro);
        return CreatedAtAction(nameof(GetCliente), new { id = cliente.Id }, resultado);
    }

    // PUT: api/clientes/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutCliente(int id, ClienteCreateDto dto)
    {
        var cliente = await _context.Clientes.FindAsync(id);
        if (cliente is null) return NotFound();

        var error = await Validar(dto, id);
        if (error is not null) return error;

        cliente.Nombre = dto.Nombre.Trim();
        cliente.Telefono = dto.Telefono.Trim();
        cliente.Email = dto.Email.Trim();

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/clientes/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteCliente(int id)
    {
        var cliente = await _context.Clientes.FindAsync(id);
        if (cliente is null) return NotFound();

        var tieneHistorial =
            await _context.Ventas.AnyAsync(v => v.ClienteId == id) ||
            await _context.Apartados.AnyAsync(a => a.ClienteId == id);

        if (tieneHistorial)
            return Conflict("No se puede eliminar el cliente porque tiene ventas o apartados registrados.");

        _context.Clientes.Remove(cliente);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // Debe haber al menos un dato de contacto (para poder avisarle) y no repetirse
    private async Task<ActionResult?> Validar(ClienteCreateDto dto, int? idActual)
    {
        var telefono = dto.Telefono.Trim();
        var email = dto.Email.Trim();

        if (await _context.Clientes.AnyAsync(c => c.Id != idActual && c.Telefono == telefono))
            return Conflict($"Ya existe un cliente con el teléfono {telefono}.");

        if (await _context.Clientes.AnyAsync(c => c.Id != idActual && c.Email == email))
            return Conflict($"Ya existe un cliente con el correo {email}.");

        return null;
    }
}