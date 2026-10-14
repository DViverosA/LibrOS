using System.ComponentModel.DataAnnotations;

namespace LibrOS.Api.Models;

public class Genero
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Nombre { get; set; } = string.Empty;

    public List<Libro> Libros { get; set; } = new();
}
