using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LibrOS.Api.Models;

public class Venta
{
    public int Id { get; set; }

    public DateTime Fecha { get; set; } = DateTime.Now;

    [Required]
    [MaxLength(100)]
    public string Vendedor { get; set; } = string.Empty;

    [Column(TypeName = "decimal(12,2)")]
    public decimal Total { get; set; }

    public List<VentaDetalle> Detalles { get; set; } = new();
}

public class VentaDetalle
{
    public int Id { get; set; }

    public int VentaId { get; set; }
    public Venta? Venta { get; set; }

    public int LibroId { get; set; }
    public Libro? Libro { get; set; }

    public int Cantidad { get; set; }

    // Precio vigente al momento de la venta (si el precio cambia después, el historial no se altera)
    [Column(TypeName = "decimal(10,2)")]
    public decimal PrecioUnitario { get; set; }

    [Column(TypeName = "decimal(12,2)")]
    public decimal Subtotal { get; set; }
}