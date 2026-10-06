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
        l.AutorId,
        l.Autor != null ? l.Autor.Nombre : null,
        l.GeneroId,
        l.Genero != null ? l.Genero.Nombre : null);

    // GET: api/libros?buscar=texto  (por ISBN o por palabra clave del título)
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LibroDto>>> GetLibros([FromQuery] string? buscar)
    {
        var query = _context.Libros.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(buscar))
        {
            var texto = buscar.Trim();
            query = query.Where(l =>
                l.Titulo.Contains(texto) ||
                (l.Isbn != null && l.Isbn.Contains(texto)));
        }

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
            Titulo = dto.Titulo,
            Isbn = string.IsNullOrWhiteSpace(dto.Isbn) ? null : dto.Isbn.Trim(),
            AnioPublicacion = dto.AnioPublicacion,
            Precio = dto.Precio,
            Cantidad = dto.Cantidad,
            AutorId = dto.AutorId,
            GeneroId = dto.GeneroId
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
        var libro = await _context.Libros.FindAsync(id);
        if (libro is null) return NotFound();

        var error = await ValidarReferencias(dto, id);
        if (error is not null) return error;

        libro.Titulo = dto.Titulo;
        libro.Isbn = string.IsNullOrWhiteSpace(dto.Isbn) ? null : dto.Isbn.Trim();
        libro.AnioPublicacion = dto.AnioPublicacion;
        libro.Precio = dto.Precio;
        libro.Cantidad = dto.Cantidad;
        libro.AutorId = dto.AutorId;
        libro.GeneroId = dto.GeneroId;

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

    // Valida autor, género e ISBN duplicado. Devuelve null si todo está bien.
    private async Task<ActionResult?> ValidarReferencias(LibroCreateDto dto, int? idActual)
    {
        if (!await _context.Autores.AnyAsync(a => a.Id == dto.AutorId))
            return BadRequest($"No existe un autor con Id {dto.AutorId}.");

        if (!await _context.Generos.AnyAsync(g => g.Id == dto.GeneroId))
            return BadRequest($"No existe un género con Id {dto.GeneroId}.");

        if (!string.IsNullOrWhiteSpace(dto.Isbn))
        {
            var isbn = dto.Isbn.Trim();
            var duplicado = await _context.Libros
                .AnyAsync(l => l.Isbn == isbn && l.Id != idActual);
            if (duplicado) return Conflict($"Ya existe un libro con el ISBN {isbn}.");
        }

        return null;
    }
}