using System.Text.Json.Serialization;

namespace LibrOS.Api.Models;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum EstadoApartado
{
    Pendiente,   // el libro sigue agotado
    Disponible,  // ya llegó stock, hay que avisar al cliente
    Entregado,
    Cancelado
}

public class Apartado
{
    public int Id { get; set; }

    public int ClienteId { get; set; }
    public Cliente? Cliente { get; set; }

    public int LibroId { get; set; }
    public Libro? Libro { get; set; }

    public int Cantidad { get; set; } = 1;
    public DateTime Fecha { get; set; } = DateTime.Now;
    public EstadoApartado Estado { get; set; } = EstadoApartado.Pendiente;

    // Cuándo pasó a Disponible
    public DateTime? FechaAviso { get; set; }
}