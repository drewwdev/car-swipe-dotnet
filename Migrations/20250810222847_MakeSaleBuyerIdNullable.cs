using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace car_swipe_dotnet.Migrations
{
    /// <inheritdoc />
    public partial class MakeSaleBuyerIdNullable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Sales_PostId",
                table: "Sales");

            migrationBuilder.AlterColumn<int>(
                name: "BuyerId",
                table: "Sales",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Sales",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateIndex(
                name: "IX_Sales_PostId",
                table: "Sales",
                column: "PostId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Sales_PostId",
                table: "Sales");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Sales");

            migrationBuilder.AlterColumn<int>(
                name: "BuyerId",
                table: "Sales",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Sales_PostId",
                table: "Sales",
                column: "PostId");
        }
    }
}
