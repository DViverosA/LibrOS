using System.Linq.Expressions;
using LibrOS.Api.Data;
using LibrOS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibrOS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LibrosController : ControllerBase
{
    private readonly AppDbContext _context;

    public LibrosController(AppDbContext context)
    {
        _context = context;
    }

    private static readonly Expression<Func<Libro, LibroDto>> ADto = l => new LibroDto(
        l.Id,
        l.Titulo,
        l.Isbn,
        l.AnioPublicacion,
        l.Precio,
        l.Cantidad,
        l.Autores.OrderBy(a => a.Nombre).Select(a => new EtiquetaDto(a.Id, a.Nombre)).ToList(),
        l.Generos.OrderBy(g => g.Nombre).Select(g => new EtiquetaDto(g.Id, g.Nombre)).ToList());

    // GET: api/libros?buscar=texto&autorId=1&generoId=2
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LibroDto>>> GetLibros(
        [FromQuery] string? buscar,
        [FromQuery] int? autorId,
        [FromQuery] int? generoId)
    {
        var query = _context.Libros.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(buscar))
        {
            var texto = buscar.Trim();
            query = query.Where(l =>
                l.Titulo.Contains(texto) ||
                (l.Isbn != null && l.Isbn.Contains(texto)));
        }

        if (autorId.HasValue)
            query = query.Where(l => l.Autores.Any(a => a.Id == autorId.Value));

        if (generoId.HasValue)
            query = query.Where(l => l.Generos.Any(g => g.Id == generoId.Value));

        var libros = await query
            .OrderBy(l => l.Titulo)
            .Select(ADto)
            .ToListAsync();

        return Ok(libros);
    }

    // GET: api/libros/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<LibroDto>> GetLibro(int id)
    {
        var libro = await _context.Libros
            .AsNoTracking()
            .Where(l => l.Id == id)
            .Select(ADto)
            .FirstOrDefaultAsync();

        if (libro is null) return NotFound();
        return Ok(libro);
    }

    // POST: api/libros
    [HttpPost]
    public async Task<ActionResult<LibroDto>> PostLibro(LibroCreateDto dto)
    {
        var error = await ValidarReferencias(dto, null);
        if (error is not null) return error;

        var libro = new Libro
        {
            Titulo = dto.Titulo.Trim(),
            Isbn = string.IsNullOrWhiteSpace(dto.Isbn) ? null : dto.Isbn.Trim(),
            AnioPublicacion = dto.AnioPublicacion,
            Precio = dto.Precio,
            Cantidad = dto.Cantidad,
            Autores = await _context.Autores.Where(a => dto.AutorIds.Contains(a.Id)).ToListAsync(),
            Generos = await _context.Generos.Where(g => dto.GeneroIds.Contains(g.Id)).ToListAsync()
        };

        _context.Libros.Add(libro);
        await _context.SaveChangesAsync();

        var resultado = await _context.Libros
            .AsNoTracking()
            .Where(l => l.Id == libro.Id)
            .Select(ADto)
            .FirstAsync();

        return CreatedAtAction(nameof(GetLibro), new { id = libro.Id }, resultado);
    }

    // PUT: api/libros/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutLibro(int id, LibroCreateDto dto)
    {
        var libro = await _context.Libros
            .Include(l => l.Autores)
            .Include(l => l.Generos)
            .FirstOrDefaultAsync(l => l.Id == id);
        if (libro is null) return NotFound();

        var error = await ValidarReferencias(dto, id);
        if (error is not null) return error;

        libro.Titulo = dto.Titulo.Trim();
        libro.Isbn = string.IsNullOrWhiteSpace(dto.Isbn) ? null : dto.Isbn.Trim();
        libro.AnioPublicacion = dto.AnioPublicacion;
        libro.Precio = dto.Precio;
        libro.Cantidad = dto.Cantidad;

        libro.Autores.Clear();
        libro.Autores.AddRange(await _context.Autores.Where(a => dto.AutorIds.Contains(a.Id)).ToListAsync());
        libro.Generos.Clear();
        libro.Generos.AddRange(await _context.Generos.Where(g => dto.GeneroIds.Contains(g.Id)).ToListAsync());

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/libros/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteLibro(int id)
    {
        var libro = await _context.Libros.FindAsync(id);
        if (libro is null) return NotFound();

        try
        {
            _context.Libros.Remove(libro);
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            return Conflict("No se puede eliminar el libro porque tiene ventas registradas.");
        }

        return NoContent();
    }

    // Valida autores, géneros, ISBN duplicado y título repetido del mismo autor. Devuelve null si todo está bien.
    private async Task<ActionResult?> ValidarReferencias(LibroCreateDto dto, int? idActual)
    {
        var autorIds = dto.AutorIds.Distinct().ToList();
        var generoIds = dto.GeneroIds.Distinct().ToList();

        if (await _context.Autores.CountAsync(a => autorIds.Contains(a.Id)) != autorIds.Count)
            return BadRequest("Uno o más autores seleccionados no existen.");

        if (await _context.Generos.CountAsync(g => generoIds.Contains(g.Id)) != generoIds.Count)
            return BadRequest("Uno o más géneros seleccionados no existen.");

        if (!string.IsNullOrWhiteSpace(dto.Isbn))
        {
            var isbn = dto.Isbn.Trim();
            var duplicado = await _context.Libros
                .AnyAsync(l => l.Isbn == isbn && l.Id != idActual);
            if (duplicado) return Conflict($"Ya existe un libro con el ISBN {isbn}.");
        }

        var titulo = dto.Titulo.Trim();
        var repetido = await _context.Libros
            .AnyAsync(l => l.Id != idActual && l.Titulo == titulo && l.Autores.Any(a => autorIds.Contains(a.Id)));
        if (repetido)
            return Conflict($"Ya existe un libro \"{titulo}\" de ese autor. Si tienes más ejemplares, aumenta su cantidad.");

        return null;
    }
}