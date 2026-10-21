using System.Linq.Expressions;
using LibrOS.Api.Data;
using LibrOS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibrOS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApartadosController : ControllerBase
{
    private readonly AppDbContext _context;

    public ApartadosController(AppDbContext context)
    {
        _context = context;
    }

    // También la usa AlertasController
    public static readonly Expression<Func<Apartado, ApartadoDto>> ADto = a => new ApartadoDto(
        a.Id,
        a.ClienteId, a.Cliente!.Nombre, a.Cliente.Telefono, a.Cliente.Email,
        a.LibroId, a.Libro!.Titulo, a.Libro.Cantidad,
        a.Cantidad, a.Fecha, a.Estado, a.FechaAviso);

    // GET: api/apartados?estado=Disponible
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ApartadoDto>>> GetApartados([FromQuery] EstadoApartado? estado)
    {
        var query = _context.Apartados.AsNoTracking();

        if (estado.HasValue)
            query = query.Where(a => a.Estado == estado.Value);

        return Ok(await query.OrderByDescending(a => a.Fecha).Select(ADto).ToListAsync());
    }

    // POST: api/apartados  (HU13-01)
    [HttpPost]
    public async Task<ActionResult<ApartadoDto>> PostApartado(ApartadoCreateDto dto)
    {
        var cliente = await _context.Clientes.AsNoTracking().FirstOrDefaultAsync(c => c.Id == dto.ClienteId);
        if (cliente is null) return BadRequest($"No existe un cliente con Id {dto.ClienteId}.");

        var libro = await _context.Libros.AsNoTracking().FirstOrDefaultAsync(l => l.Id == dto.LibroId);
        if (libro is null) return BadRequest($"No existe un libro con Id {dto.LibroId}.");

        if (libro.Cantidad > 0)
            return Conflict($"\"{libro.Titulo}\" tiene {libro.Cantidad} en stock; véndelo directamente. Los apartados son solo para libros agotados.");

        var yaApartado = await _context.Apartados.AnyAsync(a =>
            a.ClienteId == dto.ClienteId && a.LibroId == dto.LibroId &&
            (a.Estado == EstadoApartado.Pendiente || a.Estado == EstadoApartado.Disponible));
        if (yaApartado)
            return Conflict($"{cliente.Nombre} ya tiene un apartado activo de \"{libro.Titulo}\".");

        var apartado = new Apartado
        {
            ClienteId = dto.ClienteId,
            LibroId = dto.LibroId,
            Cantidad = dto.Cantidad,
            Estado = EstadoApartado.Pendiente,
            Fecha = DateTime.Now
        };

        _context.Apartados.Add(apartado);
        await _context.SaveChangesAsync();

        var resultado = await _context.Apartados.AsNoTracking()
            .Where(a => a.Id == apartado.Id).Select(ADto).FirstAsync();

        return CreatedAtAction(nameof(GetApartados), new { id = apartado.Id }, resultado);
    }

    // PUT: api/apartados/5/entregar
    [HttpPut("{id:int}/entregar")]
    public async Task<IActionResult> Entregar(int id)
    {
        var apartado = await _context.Apartados.FindAsync(id);
        if (apartado is null) return NotFound();

        if (apartado.Estado != EstadoApartado.Disponible)
            return Conflict("Solo se puede entregar un apartado cuyo libro ya está disponible.");

        apartado.Estado = EstadoApartado.Entregado;
        await _context.SaveChangesAsync();
        return NoContent();
    }

    // PUT: api/apartados/5/cancelar
    [HttpPut("{id:int}/cancelar")]
    public async Task<IActionResult> Cancelar(int id)
    {
        var apartado = await _context.Apartados.FindAsync(id);
        if (apartado is null) return NotFound();

        if (apartado.Estado is EstadoApartado.Entregado or EstadoApartado.Cancelado)
            return Conflict("Este apartado ya está cerrado.");

        apartado.Estado = EstadoApartado.Cancelado;
        await _context.SaveChangesAsync();
        return NoContent();
    }
}