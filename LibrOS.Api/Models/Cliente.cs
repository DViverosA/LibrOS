using System.ComponentModel.DataAnnotations;

namespace LibrOS.Api.Models;

public class Cliente
{
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Nombre { get; set; } = string.Empty;

    [MaxLength(30)]
    public string? Telefono { get; set; }

    [MaxLength(150)]
    public string? Email { get; set; }

    public DateTime FechaRegistro { get; set; } = DateTime.Now;
}
