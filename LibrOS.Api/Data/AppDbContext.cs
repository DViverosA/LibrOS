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
    public DbSet<Cliente> Clientes => Set<Cliente>();
    public DbSet<Apartado> Apartados => Set<Apartado>();

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

        modelBuilder.Entity<Venta>()
            .HasOne(v => v.Cliente)
            .WithMany()
            .HasForeignKey(v => v.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Apartado>()
            .HasOne(a => a.Cliente)
            .WithMany()
            .HasForeignKey(a => a.ClienteId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Apartado>()
            .HasOne(a => a.Libro)
            .WithMany()
            .HasForeignKey(a => a.LibroId)
            .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<Apartado>()
            .Property(a => a.Estado)
            .HasConversion<string>()
            .HasMaxLength(20);

        modelBuilder.Entity<Apartado>()
            .HasIndex(a => new { a.LibroId, a.Estado });

        base.OnModelCreating(modelBuilder);
    }
}
