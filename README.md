# Backend Sistema de Reservas de Restaurante

Sistema completo de reservas para restaurante desarrollado con NestJS, MySQL y Docker.

## 🚀 Características

- ✅ **CRUD de Mesas**: Gestión completa de mesas (número, capacidad, ubicación)
- ✅ **CRUD de Clientes**: Gestión de clientes con historial de reservas
- ✅ **CRUD de Reservas**: Crear, leer, modificar y cancelar reservas
- ✅ **Validaciones de Negocio**:
  - No permite doble reserva en mismo horario
  - Valida capacidad de mesas vs número de personas
  - Bloquea reservas en horarios no laborales
- ✅ **Consultas Especiales**:
  - Disponibilidad de mesas por fecha/hora
  - Reservas del día
  - Historial de cliente

## 🛠 Tecnologías

- **Backend**: NestJS + TypeScript
- **Base de Datos**: MySQL 8.0
- **ORM**: TypeORM
- **Validación**: class-validator
- **Contenedores**: Docker + Docker Compose

## 📋 Requisitos Previos

- Node.js 18+
- Docker y Docker Compose
- Git

## 🚦 Instalación y Configuración

### 1. Clonar y preparar el proyecto

\`\`\`bash
cd backend
npm install
\`\`\`

### 2. Configurar variables de entorno

El archivo \`.env\` ya está configurado con:

\`\`\`env
# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=user
DB_PASSWORD=password
DB_DATABASE=examen_final

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Aplicación
PORT=3000

# Horarios laborales
HORA_INICIO=08:00
HORA_FIN=22:00
\`\`\`

### 3. Levantar la base de datos

\`\`\`bash
docker-compose up -d
\`\`\`

Esto creará:
- ✅ MySQL 8.0 en puerto 3306
- ✅ phpMyAdmin en puerto 8080
- ✅ Base de datos "examen_final"

### 4. Iniciar el servidor

\`\`\`bash
npm run start:dev
\`\`\`

El servidor estará disponible en: \`http://localhost:3000\`

## 📡 Endpoints de la API

### 🔐 Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | \`/api/auth/register\` | Registrar nuevo usuario |
| POST | \`/api/auth/login\` | Iniciar sesión |
| GET | \`/api/auth/profile\` | Obtener perfil (requiere token) |

### 🪑 Mesas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | \`/api/mesas\` | Listar todas las mesas |
| GET | \`/api/mesas?activas=true\` | Listar solo mesas activas |
| GET | \`/api/mesas/:numero\` | Obtener mesa específica |
| GET | \`/api/mesas/capacidad/:capacidad\` | Buscar por capacidad |
| POST | \`/api/mesas\` | Crear nueva mesa |
| PATCH | \`/api/mesas/:numero\` | Actualizar mesa |
| DELETE | \`/api/mesas/:numero\` | Eliminar mesa |

### 👥 Clientes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | \`/api/clientes\` | Listar todos los clientes |
| GET | \`/api/clientes?activos=true\` | Listar solo clientes activos |
| GET | \`/api/clientes/:id\` | Obtener cliente específico |
| GET | \`/api/clientes/:id/historial\` | Historial de reservas del cliente |
| GET | \`/api/clientes/email/:email\` | Buscar por email |
| GET | \`/api/clientes/buscar?nombre=:nombre\` | Buscar por nombre |
| POST | \`/api/clientes\` | Crear nuevo cliente |
| PATCH | \`/api/clientes/:id\` | Actualizar cliente |
| DELETE | \`/api/clientes/:id\` | Eliminar cliente |

### 📅 Reservas

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | \`/api/reservas\` | Listar todas las reservas |
| GET | \`/api/reservas/dia\` | Reservas del día actual |
| GET | \`/api/reservas/dia?fecha=2024-12-01\` | Reservas de fecha específica |
| GET | \`/api/reservas/disponibilidad?fecha=2024-12-01&hora=19:00\` | Disponibilidad de mesas |
| GET | \`/api/reservas/:id\` | Obtener reserva específica |
| POST | \`/api/reservas\` | Crear nueva reserva |
| PATCH | \`/api/reservas/:id\` | Actualizar reserva |
| PATCH | \`/api/reservas/:id/cancelar\` | Cancelar reserva |
| DELETE | \`/api/reservas/:id\` | Eliminar reserva |

## 📝 Ejemplos de Uso

### Registrar Usuario

\`\`\`bash
curl -X POST http://localhost:3000/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "admin",
    "email": "admin@restaurant.com",
    "password": "123456",
    "role": "admin"
  }'
\`\`\`

### Crear Mesa

\`\`\`bash
curl -X POST http://localhost:3000/api/mesas \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "numero": 1,
    "capacidad": 4,
    "ubicacion": "Terraza principal"
  }'
\`\`\`

### Crear Cliente

\`\`\`bash
curl -X POST http://localhost:3000/api/clientes \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan@email.com",
    "telefono": "+502 1234-5678",
    "direccion": "Ciudad de Guatemala"
  }'
\`\`\`

### Crear Reserva

\`\`\`bash
curl -X POST http://localhost:3000/api/reservas \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \\
  -d '{
    "fecha_hora": "2024-12-01T19:00:00.000Z",
    "numero_personas": 4,
    "mesa_numero": 1,
    "cliente_id": 1,
    "observaciones": "Celebración de cumpleaños"
  }'
\`\`\`

### Consultar Disponibilidad

\`\`\`bash
curl "http://localhost:3000/api/reservas/disponibilidad?fecha=2024-12-01&hora=19:00" \\
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
\`\`\`

## 🔒 Validaciones Implementadas

### ✅ No Doble Reserva
- Valida que no existan reservas simultáneas en la misma mesa
- Ventana de tiempo de 2 horas para evitar solapamientos

### ✅ Capacidad de Mesa
- Verifica que el número de personas no exceda la capacidad de la mesa
- Validación en creación y modificación de reservas

### ✅ Horarios Laborales
- **Horario**: 8:00 AM - 10:00 PM
- **Días**: Lunes a Sábado (cerrado domingos)
- Rechaza reservas fuera de horario

### ✅ Otras Validaciones
- Fechas de reserva deben ser futuras
- Emails únicos para clientes
- Números de mesa únicos
- Validación de formatos de datos

## 🗃 Estructura de Base de Datos

### Tabla: mesas
- \`numero\` (PK) - Número de mesa
- \`capacidad\` - Capacidad máxima
- \`ubicacion\` - Ubicación física
- \`activa\` - Estado de la mesa

### Tabla: clientes
- \`id\` (PK) - ID autoincremental
- \`nombre\` - Nombre del cliente
- \`apellido\` - Apellido del cliente
- \`email\` - Email único
- \`telefono\` - Número de teléfono
- \`direccion\` - Dirección (opcional)
- \`activo\` - Estado del cliente

### Tabla: reservas
- \`id\` (PK) - ID autoincremental
- \`fecha_hora\` - Fecha y hora de la reserva
- \`numero_personas\` - Cantidad de personas
- \`estado\` - pendiente|confirmada|cancelada|completada
- \`observaciones\` - Notas adicionales
- \`mesa_numero\` (FK) - Referencia a mesa
- \`cliente_id\` (FK) - Referencia a cliente

### Tabla: users
- \`id\` (PK) - ID autoincremental
- \`username\` - Nombre de usuario único
- \`email\` - Email único
- \`password\` - Contraseña hasheada
- \`role\` - admin|staff

## 🐛 Debugging y Logs

El sistema incluye logging detallado para:
- Validaciones de negocio
- Errores de base de datos
- Autenticación y autorización
- Operaciones CRUD

## 🚀 Comandos Útiles

\`\`\`bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod

# Tests
npm run test
npm run test:e2e

# Linting
npm run lint

# Base de datos
docker-compose up -d      # Levantar DB
docker-compose down       # Bajar DB
docker-compose logs mysql # Ver logs de MySQL
\`\`\`

## 📞 Soporte

Para problemas o dudas:
1. Revisar los logs de la aplicación
2. Verificar conexión a base de datos
3. Validar variables de entorno
4. Consultar documentación de NestJS

## 🔧 Configuración Adicional

### phpMyAdmin
- URL: \`http://localhost:8080\`
- Usuario: \`root\`
- Contraseña: \`rootpassword\`

### Estados de Reserva
- \`pendiente\`: Recién creada
- \`confirmada\`: Confirmada por el restaurante
- \`cancelada\`: Cancelada por cliente o restaurante
- \`completada\`: Reserva realizada exitosamente

---

¡Tu sistema de reservas está listo para usar! 🎉