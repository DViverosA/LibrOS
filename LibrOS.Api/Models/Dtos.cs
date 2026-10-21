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
    int StockMinimo,
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
    [Range(0, int.MaxValue, ErrorMessage = "La cantidad no puede ser negativa.")] int Cantidad = 1,
    [Range(0, int.MaxValue, ErrorMessage = "El stock mínimo no puede ser negativo.")] int StockMinimo = 0
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
    [MinLength(1, ErrorMessage = "La venta debe incluir al menos un libro.")] List<VentaItemDto> Items,
    int? ClienteId = null
);
public record VentaDetalleDto(int LibroId, string Titulo, int Cantidad, decimal PrecioUnitario, decimal Subtotal);

public record VentaDto(
    int Id,
    DateTime Fecha,
    string Vendedor,
    decimal Total,
    int? ClienteId,
    string? ClienteNombre,
    List<VentaDetalleDto> Detalles
);

public record ClienteDto(int Id, string Nombre, string? Telefono, string? Email, DateTime FechaRegistro);

public record ClienteCreateDto(
    [Required(ErrorMessage = "El nombre es obligatorio."), MaxLength(150)] string Nombre,
    [Required(ErrorMessage = "El teléfono es obligatorio."), MaxLength(30)] string Telefono,
    [Required(ErrorMessage = "El correo electrónico es obligatorio."), MaxLength(150), EmailAddress(ErrorMessage = "El correo no tiene un formato válido.")] string Email
);

public record ClienteHistorialDto(ClienteDto Cliente, int NumeroCompras, decimal TotalGastado, List<VentaDto> Ventas);

// --- Más vendidos (HU11) ---
public record MasVendidoDto(
    int LibroId, string Titulo, string? Isbn,
    int UnidadesVendidas, decimal Ingresos, int StockActual, int StockMinimo);

// --- Apartados (HU13) ---
public record ApartadoDto(
    int Id,
    int ClienteId, string ClienteNombre, string? ClienteTelefono, string? ClienteEmail,
    int LibroId, string LibroTitulo, int StockActual,
    int Cantidad, DateTime Fecha, EstadoApartado Estado, DateTime? FechaAviso);

public record ApartadoCreateDto(
    int ClienteId,
    int LibroId,
    [Range(1, int.MaxValue, ErrorMessage = "La cantidad debe ser al menos 1.")] int Cantidad = 1);

// --- Alertas (HU13-03 y HU14) ---
public record AlertaStockDto(int LibroId, string Titulo, int Cantidad, int StockMinimo);
public record AlertasDto(List<ApartadoDto> ApartadosListos, List<AlertaStockDto> StockBajo);
public record LibroActualizadoDto(LibroDto Libro, List<ApartadoDto> ApartadosAtendibles);