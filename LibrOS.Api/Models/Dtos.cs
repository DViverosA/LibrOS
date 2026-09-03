namespace LibrOS.Api.Models;

public record LibroDto(
    int Id,
    string Titulo,
    int? AnioPublicacion,
    decimal? Precio,
    int AutorId,
    string? AutorNombre,
    int GeneroId,
    string? GeneroNombre
);

public record LibroCreateDto(
    string Titulo,
    int? AnioPublicacion,
    decimal? Precio,
    int AutorId,
    int GeneroId
);

public record AutorDto(int Id, string Nombre, string? Nacionalidad);
public record AutorCreateDto(string Nombre, string? Nacionalidad);

public record GeneroDto(int Id, string Nombre);
public record GeneroCreateDto(string Nombre);
