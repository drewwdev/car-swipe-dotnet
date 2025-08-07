using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace car_swipe_dotnet.Migrations
{
    /// <inheritdoc />
    public partial class AddIsLikedNotifiedToPosts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsLikedNotified",
                table: "Posts",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsLikedNotified",
                table: "Posts");
        }
    }
}
