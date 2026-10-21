using LibrOS.Api.Data;
using LibrOS.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibrOS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AlertasController : ControllerBase
{
    private readonly AppDbContext _context;

    public AlertasController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/alertas
    [HttpGet]
    public async Task<ActionResult<AlertasDto>> GetAlertas()
    {
        var apartadosListos = await _context.Apartados.AsNoTracking()
            .Where(a => a.Estado == EstadoApartado.Disponible)
            .OrderBy(a => a.FechaAviso)
            .Select(ApartadosController.ADto)
            .ToListAsync();

        // StockMinimo = 0 significa "sin alerta"
        var stockBajo = await _context.Libros.AsNoTracking()
            .Where(l => l.StockMinimo > 0 && l.Cantidad < l.StockMinimo)
            .OrderBy(l => l.Cantidad)
            .Select(l => new AlertaStockDto(l.Id, l.Titulo, l.Cantidad, l.StockMinimo))
            .ToListAsync();

        return Ok(new AlertasDto(apartadosListos, stockBajo));
    }
}