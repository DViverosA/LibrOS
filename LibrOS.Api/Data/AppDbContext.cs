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
            .HasOne(l => l.Autor)
            .WithMany(a => a.Libros)
            .HasForeignKey(l => l.AutorId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Libro>()
            .HasOne(l => l.Genero)
            .WithMany(g => g.Libros)
            .HasForeignKey(l => l.GeneroId)
            .OnDelete(DeleteBehavior.Restrict);

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
