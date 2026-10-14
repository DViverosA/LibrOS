using LibrOS.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace LibrOS.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Libro> Libros => Set<Libro>();
    public DbSet<Autor> Autores => Set<Autor>();
    public DbSet<Genero> Generos => Set<Genero>();
    public DbSet<Venta> Ventas => Set<Venta>();
    public DbSet<VentaDetalle> VentaDetalles => Set<VentaDetalle>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Libro>()
            .HasMany(l => l.Autores)
            .WithMany(a => a.Libros)
            .UsingEntity<Dictionary<string, object>>(
                "AutorLibro",
                j => j.HasOne<Autor>().WithMany().HasForeignKey("AutoresId").OnDelete(DeleteBehavior.Restrict),
                j => j.HasOne<Libro>().WithMany().HasForeignKey("LibrosId").OnDelete(DeleteBehavior.Cascade));

        modelBuilder.Entity<Libro>()
            .HasMany(l => l.Generos)
            .WithMany(g => g.Libros)
            .UsingEntity<Dictionary<string, object>>(
                "GeneroLibro",
                j => j.HasOne<Genero>().WithMany().HasForeignKey("GenerosId").OnDelete(DeleteBehavior.Restrict),
                j => j.HasOne<Libro>().WithMany().HasForeignKey("LibrosId").OnDelete(DeleteBehavior.Cascade));

        modelBuilder.Entity<Libro>()
            .HasIndex(l => l.Isbn)
            .IsUnique()
            .HasFilter("[Isbn] IS NOT NULL");

        modelBuilder.Entity<VentaDetalle>()
            .HasOne(d => d.Venta)
            .WithMany(v => v.Detalles)
            .HasForeignKey(d => d.VentaId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<VentaDetalle>()
            .HasOne(d => d.Libro)
            .WithMany()
            .HasForeignKey(d => d.LibroId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Venta>()
            .HasIndex(v => v.Fecha);

        base.OnModelCreating(modelBuilder);
    }
}
