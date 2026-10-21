using LibrOS.Api.Data;
using LibrOS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LibrOS.Api.Services;

public static class ApartadoNotificador
{
    // Pasa a Disponible los apartados Pendiente del libro, por orden de llegada,
    // mientras alcance el stock que no esté ya comprometido con otros apartados Disponible.
    public static async Task<int> MarcarDisponiblesAsync(AppDbContext context, int libroId)
    {
        var libro = await context.Libros.AsNoTracking().FirstOrDefaultAsync(l => l.Id == libroId);
        if (libro is null || libro.Cantidad <= 0) return 0;

        var comprometido = await context.Apartados
            .Where(a => a.LibroId == libroId && a.Estado == EstadoApartado.Disponible)
            .SumAsync(a => (int?)a.Cantidad) ?? 0;

        var restante = libro.Cantidad - comprometido;

        var pendientes = await context.Apartados
            .Where(a => a.LibroId == libroId && a.Estado == EstadoApartado.Pendiente)
            .OrderBy(a => a.Fecha)
            .ToListAsync();

        var marcados = 0;
        foreach (var apartado in pendientes)
        {
            if (apartado.Cantidad > restante) break;

            apartado.Estado = EstadoApartado.Disponible;
            apartado.FechaAviso = DateTime.Now;
            restante -= apartado.Cantidad;
            marcados++;
        }

        if (marcados > 0) await context.SaveChangesAsync();
        return marcados;
    }
}