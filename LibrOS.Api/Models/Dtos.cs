using System.ComponentModel.DataAnnotations;

namespace LibrOS.Api.Models;

public record LibroDto(
    int Id,
    string Titulo,
    string? Isbn,
    int? AnioPublicacion,
    decimal Precio,
    int Cantidad,
    int AutorId,
    string? AutorNombre,
    int GeneroId,
    string? GeneroNombre
);

public record LibroCreateDto(
    [Required, MaxLength(200)] string Titulo,
    [MaxLength(20)] string? Isbn,
    int? AnioPublicacion,
    [Range(typeof(decimal), "0", "99999999.99", ErrorMessage = "El precio no puede ser negativo.")] decimal Precio,
    int AutorId,
    int GeneroId,
    [Range(0, int.MaxValue, ErrorMessage = "La cantidad no puede ser negativa.")] int Cantidad = 1
);

public record AutorDto(int Id, string Nombre, string? Nacionalidad);
public record AutorCreateDto(string Nombre, string? Nacionalidad);

public record GeneroDto(int Id, string Nombre);
public record GeneroCreateDto(string Nombre);

public record VentaItemDto(
    int LibroId,
    [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser al menos 1.")] int Cantidad
);

public record VentaCreateDto(
    [Required, MaxLength(100)] string Vendedor,
    [MinLength(1, ErrorMessage = "La venta debe incluir al menos un libro.")] List<VentaItemDto> Items
);
public record VentaDetalleDto(int LibroId, string Titulo, int Cantidad, decimal PrecioUnitario, decimal Subtotal);

public record VentaDto(int Id, DateTime Fecha, string Vendedor, decimal Total, List<VentaDetalleDto> Detalles);