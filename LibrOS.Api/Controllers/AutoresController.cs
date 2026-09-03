using LibrOS.Api.Data;
using LibrOS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibrOS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AutoresController : ControllerBase
{
    private readonly AppDbContext _context;

    public AutoresController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/autores
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AutorDto>>> GetAutores()
    {
        var autores = await _context.Autores
            .AsNoTracking()
            .Select(a => new AutorDto(a.Id, a.Nombre, a.Nacionalidad))
            .ToListAsync();

        return Ok(autores);
    }

    // GET: api/autores/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<AutorDto>> GetAutor(int id)
    {
        var autor = await _context.Autores
            .AsNoTracking()
            .Where(a => a.Id == id)
            .Select(a => new AutorDto(a.Id, a.Nombre, a.Nacionalidad))
            .FirstOrDefaultAsync();

        if (autor is null) return NotFound();
        return Ok(autor);
    }

    // POST: api/autores
    [HttpPost]
    public async Task<ActionResult<AutorDto>> PostAutor(AutorCreateDto dto)
    {
        var autor = new Autor { Nombre = dto.Nombre, Nacionalidad = dto.Nacionalidad };
        _context.Autores.Add(autor);
        await _context.SaveChangesAsync();

        var resultado = new AutorDto(autor.Id, autor.Nombre, autor.Nacionalidad);
        return CreatedAtAction(nameof(GetAutor), new { id = autor.Id }, resultado);
    }

    // PUT: api/autores/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutAutor(int id, AutorCreateDto dto)
    {
        var autor = await _context.Autores.FindAsync(id);
        if (autor is null) return NotFound();

        autor.Nombre = dto.Nombre;
        autor.Nacionalidad = dto.Nacionalidad;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/autores/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteAutor(int id)
    {
        var autor = await _context.Autores.FindAsync(id);
        if (autor is null) return NotFound();

        _context.Autores.Remove(autor);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
