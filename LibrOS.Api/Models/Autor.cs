using System.ComponentModel.DataAnnotations;

namespace LibrOS.Api.Models;

public class Autor
{
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Nombre { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Nacionalidad { get; set; }

    public List<Libro> Libros { get; set; } = new();
}
