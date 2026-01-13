# Commerce Insights - Sistema de Recopilación de Datos

Sistema para recopilar y analizar datos de la base de datos MongoDB de comercios.

## Requisitos

- Node.js 16+
- npm o yarn
- MongoDB 4.4+ (local o MongoDB Atlas)

## Instalación

1. **Clonar o descargar el repositorio**

2. **Crear un archivo `.env` basado en `.env.example`**
   ```bash
   cp .env.example .env
   ```

3. **Editar el archivo `.env` con tu configuración de MongoDB**
   
   **Para MongoDB local:**
   ```
   MONGO_URI=mongodb://localhost:27017/commerce_db
   ```
   
   **Para MongoDB Atlas (cloud):**
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/commerce_db?retryWrites=true&w=majority
   ```

4. **Instalar las dependencias**
   ```bash
   npm install
   ```

## Uso

### Desarrollo con ts-node (sin compilar)

```bash
npm run dev
```

Este comando:
- Prueba la conexión a MongoDB
- Obtiene el número de documentos en la colección `transaction`

### Compilar el proyecto

```bash
npm run build
```

Genera los archivos compilados en la carpeta `dist/`

### Ejecutar versión compilada

```bash
npm start
```

## Estructura del Proyecto

```
commerce-insights/
├── src/
│   ├── config.ts          # Configuración
│   ├── db.ts              # Funciones de conexión y consultas
│   └── index.ts           # Script principal
├── dist/                  # Archivos compilados (generado por tsc)
├── package.json           # Dependencias
├── tsconfig.json          # Configuración de TypeScript
├── .env.example          # Ejemplo de configuración
├── README.md             # Este archivo
└── .gitignore            # Archivos ignorados por git
```

## Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `MONGO_URI` | URI de conexión a MongoDB | `mongodb://localhost:27017/commerce_db` |
| `MONGO_USER` | Usuario de MongoDB (opcional) | `admin` |
| `MONGO_PASSWORD` | Contraseña de MongoDB (opcional) | `password123` |

