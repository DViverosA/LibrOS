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

    // GET: api/libros
    [HttpGet]
    public async Task<ActionResult<IEnumerable<LibroDto>>> GetLibros()
    {
        var libros = await _context.Libros
            .AsNoTracking()
            .Include(l => l.Autor)
            .Include(l => l.Genero)
            .Select(l => new LibroDto(
                l.Id,
                l.Titulo,
                l.AnioPublicacion,
                l.Precio,
                l.AutorId,
                l.Autor != null ? l.Autor.Nombre : null,
                l.GeneroId,
                l.Genero != null ? l.Genero.Nombre : null))
            .ToListAsync();

        return Ok(libros);
    }

    // GET: api/libros/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<LibroDto>> GetLibro(int id)
    {
        var libro = await _context.Libros
            .AsNoTracking()
            .Include(l => l.Autor)
            .Include(l => l.Genero)
            .Where(l => l.Id == id)
            .Select(l => new LibroDto(
                l.Id,
                l.Titulo,
                l.AnioPublicacion,
                l.Precio,
                l.AutorId,
                l.Autor != null ? l.Autor.Nombre : null,
                l.GeneroId,
                l.Genero != null ? l.Genero.Nombre : null))
            .FirstOrDefaultAsync();

        if (libro is null) return NotFound();
        return Ok(libro);
    }

    // POST: api/libros
    [HttpPost]
    public async Task<ActionResult<LibroDto>> PostLibro(LibroCreateDto dto)
    {
        var autorExiste = await _context.Autores.AnyAsync(a => a.Id == dto.AutorId);
        var generoExiste = await _context.Generos.AnyAsync(g => g.Id == dto.GeneroId);

        if (!autorExiste) return BadRequest($"No existe un autor con Id {dto.AutorId}.");
        if (!generoExiste) return BadRequest($"No existe un genero con Id {dto.GeneroId}.");

        var libro = new Libro
        {
            Titulo = dto.Titulo,
            AnioPublicacion = dto.AnioPublicacion,
            Precio = dto.Precio,
            AutorId = dto.AutorId,
            GeneroId = dto.GeneroId
        };

        _context.Libros.Add(libro);
        await _context.SaveChangesAsync();

        var autor = await _context.Autores.FindAsync(dto.AutorId);
        var genero = await _context.Generos.FindAsync(dto.GeneroId);

        var resultado = new LibroDto(
            libro.Id, libro.Titulo, libro.AnioPublicacion, libro.Precio,
            libro.AutorId, autor?.Nombre, libro.GeneroId, genero?.Nombre);

        return CreatedAtAction(nameof(GetLibro), new { id = libro.Id }, resultado);
    }

    // PUT: api/libros/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutLibro(int id, LibroCreateDto dto)
    {
        var libro = await _context.Libros.FindAsync(id);
        if (libro is null) return NotFound();

        libro.Titulo = dto.Titulo;
        libro.AnioPublicacion = dto.AnioPublicacion;
        libro.Precio = dto.Precio;
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

        _context.Libros.Remove(libro);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
