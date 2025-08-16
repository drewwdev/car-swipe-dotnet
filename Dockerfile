FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app ./
EXPOSE 10000
ENV ASPNETCORE_URLS=http://0.0.0.0:10000
ENTRYPOINT ["dotnet", "Server.dll"]
