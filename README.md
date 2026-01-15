# Commerce Insights - Sistema de Agregaciones por Lotes

Sistema para ejecutar agregaciones en MongoDB por lotes configurables y almacenar los resultados en archivos JSON.

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
- Conecta a MongoDB
- Ejecuta agregaciones por lotes configurables
- Guarda los resultados en archivos JSON en la carpeta `results/`

### Compilar el proyecto

```bash
npm run build
```

Genera los archivos compilados en la carpeta `dist/`

### Ejecutar versión compilada

```bash
npm start
```

## Sistema de Agregaciones por Lotes

El sistema permite ejecutar agregaciones de MongoDB procesando los datos en lotes configurables. Esto es útil para:

- Procesar grandes volúmenes de datos sin sobrecargar la memoria
- Controlar el ritmo de procesamiento
- Manejar timeouts en agregaciones complejas

### Estrategias de Procesamiento

1. **pre-aggregation**: Procesa documentos en lotes antes de aplicar la agregación
   - Útil para agregaciones simples o extracción de datos
   - Cada lote se procesa independientemente

2. **post-aggregation**: Ejecuta la agregación completa y luego procesa resultados por lotes
   - Útil para agregaciones complejas que agrupan datos
   - Primero se ejecuta toda la agregación, luego se dividen los resultados

## Estructura del Proyecto

```
commerce-insights/
├── src/
│   ├── aggregations/          # Pipelines de agregación
│   │   └── sample.aggregation.ts
│   ├── config/                # Configuraciones
│   │   └── batch.config.ts    # Configuración de lotes
│   ├── services/              # Servicios
│   │   ├── aggregation.service.ts  # Servicio de agregaciones
│   │   └── file.service.ts         # Servicio de archivos JSON
│   ├── config.ts              # Configuración general
│   ├── db.ts                  # Funciones de conexión
│   └── index.ts               # Script principal
├── results/                   # Resultados JSON (generado)
├── dist/                      # Archivos compilados (generado)
├── package.json
├── tsconfig.json
└── README.md
```

## Variables de Entorno

| Variable | Descripción | Valor por Defecto |
|----------|-------------|-------------------|
| `MONGO_URI` | URI de conexión a MongoDB | `mongodb://localhost:27017/commerce_db` |
| `MONGO_USER` | Usuario de MongoDB (opcional) | - |
| `MONGO_PASSWORD` | Contraseña de MongoDB (opcional) | - |
| `BATCH_SIZE` | Tamaño de cada lote | `1000` |
| `BATCH_DELAY` | Delay en ms entre lotes | `500` |
| `MAX_BATCHES` | Número máximo de lotes (opcional) | Sin límite |
| `OUTPUT_DIRECTORY` | Directorio para guardar resultados | `results` |

