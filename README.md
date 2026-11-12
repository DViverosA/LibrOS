# LibrOS

Sistema de administración para una librería, desarrollado como proyecto escolar por sprints. Permite gestionar el inventario de libros (con varios autores y géneros por libro), registrar ventas, llevar un registro de clientes frecuentes y sus compras, apartar libros agotados y recibir alertas de reabastecimiento.

- **Backend:** API REST en ASP.NET Core (.NET 10) con Entity Framework Core y SQL Server.
- **Frontend:** aplicación web en React con Vite.

## Estructura del repositorio

```
LibrOS.Api/       -> Web API (.NET 10, EF Core, SQL Server)
LibrOS-front/     -> Frontend (React + Vite)
```

## Funcionalidades

| Historia | Descripción |
|----------|-------------|
| HU01 – Interfaz | Diseño adaptable, con barra de navegación lateral consistente en todas las secciones |
| HU02 – Registro de libros | Alta de libros con validaciones (campos obligatorios, ISBN y título duplicados) y mensaje de confirmación |
| HU03 – Detalles de libros | Asignación de uno o varios autores y géneros por libro; filtro del inventario por autor y género |
| HU04 – Cantidad | Cantidad en inventario por libro (1 por defecto, no puede ser negativa) |
| HU05 – Precio | Precio por libro (0 por defecto), mostrado con formato de moneda |
| HU06 – Búsqueda | Búsqueda por ISBN, título o palabra clave, con mensaje cuando no hay coincidencias |
| HU07 – Tabla de libros | Tabla con ordenamiento por columna y paginación |
| HU08 – Reducción de inventario | Al vender se descuenta el stock; si no alcanza, la venta se rechaza |
| HU09 – Cálculo de precio | Total en tiempo real en el carrito (precio × cantidad) |
| HU10 – Registro de ventas | Ventas guardadas con fecha, libros, cantidades, total y vendedor; historial por fecha reciente |
| HU11 – Más vendidos | Ranking de libros por unidades vendidas, con filtro por fechas |
| HU12 – Clientes frecuentes | Perfil de cliente (nombre, teléfono y correo) con ID único; las ventas se pueden asociar a un cliente y consultar su historial |
| HU13 – Apartados | Apartado de libros agotados para un cliente; al ingresar stock el sistema avisa qué apartados ya se pueden atender |
| HU14 – Alerta de stock mínimo | Cada libro puede tener un stock mínimo; si baja de ese valor se muestra una alerta de reabastecimiento |

## Requisitos

### Backend
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- SQL Server (por defecto se usa la instancia local `localhost\SQLEXPRESS`)
- Visual Studio con soporte para .NET 10 (recomendado) o la CLI de .NET

### Frontend
- [Node.js](https://nodejs.org/) 18 o superior (incluye `npm`)
- Visual Studio Code recomendado para el frontend

Para verificar las versiones instaladas:

```
dotnet --list-sdks
node -v
```

## Instrucciones: Backend (LibrOS.Api)

1. Abre `LibrOS.Api/LibrOS.Api.csproj` en Visual Studio.
2. Revisa la cadena de conexión en `appsettings.json`. Por defecto apunta a `localhost\SQLEXPRESS` y a la base de datos `LibrOSDb`:
   ```json
   "DefaultConnection": "Server=localhost\\SQLEXPRESS;Database=LibrOSDb;Trusted_Connection=True;TrustServerCertificate=True;"
   ```
   Ajústala si tu instancia de SQL Server es distinta.
3. En el selector de perfiles de ejecución (junto al botón ▶), elige **https** (no "IIS Express").
4. Ejecuta el proyecto con F5. Swagger queda disponible en `https://localhost:44384/swagger`.

**Migraciones:** ya están incluidas en la carpeta `Migrations/`. No necesitas ejecutar `Add-Migration` ni `Update-Database`: al iniciar en modo desarrollo, la API crea la base de datos (si no existe) y aplica las migraciones pendientes automáticamente. Solo tendrás que correr `Add-Migration NombreNuevo` cuando modifiques el modelo de datos.

Si el navegador bloquea el certificado HTTPS de desarrollo, ejecuta una vez:

```
dotnet dev-certs https --trust
```

## Instrucciones: Frontend (LibrOS-front)

1. Abre una terminal en la carpeta del frontend (mediante Visual Studio Code) e instala las dependencias:
   ```
   cd LibrOS-front
   npm install
   ```
2. Verifica que `src/api/client.js` apunte a la URL de tu API (por defecto `https://localhost:44384/api`). Cámbiala solo si tu API corre en otro puerto.
3. Inicia el servidor de desarrollo:
   ```
   npm run dev
   ```
4. Abre `http://localhost:5173` en el navegador.

> La API debe estar corriendo antes de abrir el frontend.

## Orden de uso recomendado

1. Registra al menos un **autor** y un **género**.
2. Registra **libros** (con precio mayor a 0 y stock para poder venderlos).
3. Registra **clientes frecuentes** (opcional) para asociarlos a ventas y apartados.
4. Registra **ventas** desde "Nueva venta" y consulta el **historial**.
5. Consulta **Más vendidos** y atiende las **alertas** de stock y apartados.

## Notas

- **Ventas:** el total lo calcula el servidor con los precios de la base de datos. Cada venta guarda el precio vigente al momento de la compra, por lo que cambiar el precio después no altera el historial.
- **Apartados:** solo se pueden apartar libros agotados. Al aumentar el stock de un libro, sus apartados pendientes pasan a "Disponible" por orden de llegada.
- **Eliminación:** no se puede eliminar un libro o un cliente que ya tenga ventas o apartados registrados.
- **Vendedor:** es un campo de texto libre, ya que el proyecto no incluye autenticación.
- **CORS:** la API permite el origen `http://localhost:5173`. Si Vite usa otro puerto, agrégalo en `Program.cs`.
- **IIS Express:** no es necesario; usa el perfil `https` (Kestrel) para desarrollo local.

## Tecnologías

ASP.NET Core (.NET 10) · Entity Framework Core 10 · SQL Server · Swagger · React 18 · Vite · React Router · Axios
