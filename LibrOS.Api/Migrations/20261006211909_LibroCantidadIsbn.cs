using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LibrOS.Api.Migrations
{
    /// <inheritdoc />
    public partial class LibroCantidadIsbn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "Precio",
                table: "Libros",
                type: "decimal(10,2)",
                nullable: false,
                defaultValue: 0m,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,2)",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Cantidad",
                table: "Libros",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Isbn",
                table: "Libros",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Libros_Isbn",
                table: "Libros",
                column: "Isbn",
                unique: true,
                filter: "[Isbn] IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Libros_Isbn",
                table: "Libros");

            migrationBuilder.DropColumn(
                name: "Cantidad",
                table: "Libros");

            migrationBuilder.DropColumn(
                name: "Isbn",
                table: "Libros");

            migrationBuilder.AlterColumn<decimal>(
                name: "Precio",
                table: "Libros",
                type: "decimal(10,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(10,2)");
        }
    }
}
