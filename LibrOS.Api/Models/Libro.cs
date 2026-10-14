using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LibrOS.Api.Models;

public class Libro
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Titulo { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Isbn { get; set; }

    public int? AnioPublicacion { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal Precio { get; set; } = 0;

    public int Cantidad { get; set; } = 1;

    public List<Autor> Autores { get; set; } = new();
    public List<Genero> Generos { get; set; } = new();
}