# LibrOS — Backend (.NET 10) + Frontend (React + Vite)

## Estructura
```
LibrOS.Api/     -> Web API en .NET 10 (EF Core + SQL Server)
LibrOS-front/     -> Frontend en React + Vite
```

## 1. Backend (LibrOS.Api)

1. Abre `LibrOS.Api.csproj` en Visual Studio.
2. Revisa la cadena de conexión en `appsettings.json` (por defecto apunta a `localhost\SQLEXPRESS`, base `LibrOSDb`).
3. La migración inicial (`InicialLibros`) ya está incluida en el repo dentro de `Migrations/`. **No necesitas** correr `Add-Migration` ni `Update-Database` manualmente — el proyecto aplica las migraciones pendientes automáticamente al arrancar (en modo desarrollo), y crea la base de datos si no existe.
   Solo tendrás que correr `Add-Migration NombreNuevo` el día que agregues un cambio al modelo (ver nota más abajo).
4. En el dropdown de perfiles de ejecución (junto al botón ▶ verde), selecciona **https** (no "IIS Express").
5. Ejecuta el proyecto (F5). Debe abrir Swagger en `https://localhost:44384/swagger`.
6. Si el navegador bloquea el certificado de desarrollo, corre una vez en terminal:
   ```
   dotnet dev-certs https --trust
   ```

## 2. Frontend (LibrOS-front)

1. Necesitas Node.js instalado (v18 o superior). Verifica con:
   ```
   node -v
   ```
2. Entra a la carpeta e instala dependencias:
   ```
   cd LibrOS-front
   npm install
   ```
3. `src/api/client.js` ya apunta a `https://localhost:44384/api`. Solo cámbialo si tu API corre en otro puerto.
4. Corre el frontend:
   ```
   npm run dev
   ```
5. Abre `http://localhost:5173` en el navegador.

## Notas importantes

- **CORS**: el backend tiene habilitado CORS para `http://localhost:5173` en `Program.cs`. Si Vite te asigna otro puerto (por ejemplo si el 5173 está ocupado, usará 5174), agrégalo a la lista de orígenes permitidos ahí.
- **Migraciones automáticas**: cada vez que agregues un cambio al modelo, corre `Add-Migration NombreDeLaMigracion` y listo — se aplica sola al iniciar el proyecto en modo desarrollo. Esto **no** ocurre en producción por seguridad.
- **Orden de uso**: primero crea al menos un Autor y un Género desde sus pantallas correspondientes antes de intentar crear un Libro (el formulario de Libros depende de esos catálogos).
- **IIS Express**: no es necesario ni recomendado para este proyecto. Usa siempre el perfil `https` (Kestrel) para desarrollo local.
