using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LibrOS.Api.Models;

public class Libro
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Titulo { get; set; } = string.Empty;

    public int? AnioPublicacion { get; set; }

    [Column(TypeName = "decimal(10,2)")]
    public decimal? Precio { get; set; }

    public int AutorId { get; set; }
    public Autor? Autor { get; set; }

    public int GeneroId { get; set; }
    public Genero? Genero { get; set; }
}
