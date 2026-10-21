using LibrOS.Api.Data;
using LibrOS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibrOS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReportesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReportesController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/reportes/mas-vendidos?top=10&desde=2026-10-01&hasta=2026-10-31
    [HttpGet("mas-vendidos")]
    public async Task<ActionResult<IEnumerable<MasVendidoDto>>> GetMasVendidos(
        [FromQuery] int top = 10,
        [FromQuery] DateTime? desde = null,
        [FromQuery] DateTime? hasta = null)
    {
        top = Math.Clamp(top, 1, 100);

        var detalles = _context.VentaDetalles.AsNoTracking().AsQueryable();

        if (desde.HasValue)
            detalles = detalles.Where(d => d.Venta!.Fecha >= desde.Value.Date);
        if (hasta.HasValue)
            detalles = detalles.Where(d => d.Venta!.Fecha < hasta.Value.Date.AddDays(1));

        var ranking = await detalles
            .GroupBy(d => d.LibroId)
            .Select(g => new
            {
                LibroId = g.Key,
                Unidades = g.Sum(x => x.Cantidad),
                Ingresos = g.Sum(x => x.Subtotal)
            })
            .OrderByDescending(x => x.Unidades)
            .ThenByDescending(x => x.Ingresos)
            .Take(top)
            .ToListAsync();

        var ids = ranking.Select(r => r.LibroId).ToList();
        var libros = await _context.Libros.AsNoTracking()
            .Where(l => ids.Contains(l.Id))
            .ToDictionaryAsync(l => l.Id);

        var resultado = ranking.Select(r =>
        {
            var l = libros[r.LibroId];
            return new MasVendidoDto(l.Id, l.Titulo, l.Isbn, r.Unidades, r.Ingresos, l.Cantidad, l.StockMinimo);
        });

        return Ok(resultado);
    }
}