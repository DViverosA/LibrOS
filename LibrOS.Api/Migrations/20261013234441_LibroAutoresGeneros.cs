using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LibrOS.Api.Migrations
{
    /// <inheritdoc />
    public partial class LibroAutoresGeneros : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Libros_Autores_AutorId",
                table: "Libros");

            migrationBuilder.DropForeignKey(
                name: "FK_Libros_Generos_GeneroId",
                table: "Libros");

            migrationBuilder.DropIndex(
                name: "IX_Libros_AutorId",
                table: "Libros");

            migrationBuilder.DropIndex(
                name: "IX_Libros_GeneroId",
                table: "Libros");

            migrationBuilder.DropColumn(
                name: "AutorId",
                table: "Libros");

            migrationBuilder.DropColumn(
                name: "GeneroId",
                table: "Libros");

            migrationBuilder.CreateTable(
                name: "AutorLibro",
                columns: table => new
                {
                    AutoresId = table.Column<int>(type: "int", nullable: false),
                    LibrosId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AutorLibro", x => new { x.AutoresId, x.LibrosId });
                    table.ForeignKey(
                        name: "FK_AutorLibro_Autores_AutoresId",
                        column: x => x.AutoresId,
                        principalTable: "Autores",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AutorLibro_Libros_LibrosId",
                        column: x => x.LibrosId,
                        principalTable: "Libros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "GeneroLibro",
                columns: table => new
                {
                    GenerosId = table.Column<int>(type: "int", nullable: false),
                    LibrosId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GeneroLibro", x => new { x.GenerosId, x.LibrosId });
                    table.ForeignKey(
                        name: "FK_GeneroLibro_Generos_GenerosId",
                        column: x => x.GenerosId,
                        principalTable: "Generos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_GeneroLibro_Libros_LibrosId",
                        column: x => x.LibrosId,
                        principalTable: "Libros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AutorLibro_LibrosId",
                table: "AutorLibro",
                column: "LibrosId");

            migrationBuilder.CreateIndex(
                name: "IX_GeneroLibro_LibrosId",
                table: "GeneroLibro",
                column: "LibrosId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AutorLibro");

            migrationBuilder.DropTable(
                name: "GeneroLibro");

            migrationBuilder.AddColumn<int>(
                name: "AutorId",
                table: "Libros",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "GeneroId",
                table: "Libros",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_Libros_AutorId",
                table: "Libros",
                column: "AutorId");

            migrationBuilder.CreateIndex(
                name: "IX_Libros_GeneroId",
                table: "Libros",
                column: "GeneroId");

            migrationBuilder.AddForeignKey(
                name: "FK_Libros_Autores_AutorId",
                table: "Libros",
                column: "AutorId",
                principalTable: "Autores",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Libros_Generos_GeneroId",
                table: "Libros",
                column: "GeneroId",
                principalTable: "Generos",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
