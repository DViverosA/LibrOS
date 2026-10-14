using LibrOS.Api.Data;
using LibrOS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibrOS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GenerosController : ControllerBase
{
    private readonly AppDbContext _context;

    public GenerosController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/generos
    [HttpGet]
    public async Task<ActionResult<IEnumerable<GeneroDto>>> GetGeneros()
    {
        var generos = await _context.Generos
            .AsNoTracking()
            .Select(g => new GeneroDto(g.Id, g.Nombre))
            .ToListAsync();

        return Ok(generos);
    }

    // GET: api/generos/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<GeneroDto>> GetGenero(int id)
    {
        var genero = await _context.Generos
            .AsNoTracking()
            .Where(g => g.Id == id)
            .Select(g => new GeneroDto(g.Id, g.Nombre))
            .FirstOrDefaultAsync();

        if (genero is null) return NotFound();
        return Ok(genero);
    }

    // POST: api/generos
    [HttpPost]
    public async Task<ActionResult<GeneroDto>> PostGenero(GeneroCreateDto dto)
    {
        var genero = new Genero { Nombre = dto.Nombre };
        _context.Generos.Add(genero);
        await _context.SaveChangesAsync();

        var resultado = new GeneroDto(genero.Id, genero.Nombre);
        return CreatedAtAction(nameof(GetGenero), new { id = genero.Id }, resultado);
    }

    // PUT: api/generos/5
    [HttpPut("{id:int}")]
    public async Task<IActionResult> PutGenero(int id, GeneroCreateDto dto)
    {
        var genero = await _context.Generos.FindAsync(id);
        if (genero is null) return NotFound();

        genero.Nombre = dto.Nombre;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    // DELETE: api/generos/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteGenero(int id)
    {
        var genero = await _context.Generos.FindAsync(id);
        if (genero is null) return NotFound();

        _context.Generos.Remove(genero);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
