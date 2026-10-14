using System.ComponentModel.DataAnnotations;

namespace LibrOS.Api.Models;

public record EtiquetaDto(int Id, string Nombre);

public record LibroDto(
    int Id,
    string Titulo,
    string? Isbn,
    int? AnioPublicacion,
    decimal Precio,
    int Cantidad,
    List<EtiquetaDto> Autores,
    List<EtiquetaDto> Generos
    );

public record LibroCreateDto(
    [Required(ErrorMessage = "El título es obligatorio."), MaxLength(200, ErrorMessage = "El título no puede pasar de 200 caracteres.")] string Titulo,
    [MaxLength(20, ErrorMessage = "El ISBN no puede pasar de 20 caracteres.")] string? Isbn,
    int? AnioPublicacion,
    [Range(typeof(decimal), "0", "99999999.99", ErrorMessage = "El precio no puede ser negativo.")] decimal Precio,
    [Required(ErrorMessage = "Selecciona al menos un autor."), MinLength(1, ErrorMessage = "Selecciona al menos un autor.")] List<int> AutorIds,
    [Required(ErrorMessage = "Selecciona al menos un género."), MinLength(1, ErrorMessage = "Selecciona al menos un género.")] List<int> GeneroIds,
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