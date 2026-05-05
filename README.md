# UstaGallery

Plataforma de galería de arte digital para el Semillero de Arte de la **Universidad Santo Tomás** (Tunja). Permite a estudiantes publicar y gestionar sus obras, a profesores administrar grupos y clases, y al público explorar la colección.

> **Versión:** 1.0.0 — Mayo 2026

---

## Arquitectura

El sistema está compuesto por dos aplicaciones independientes con sus propios repositorios:

```
ProyectoGrado/
├── UstaGalleryClient/     # Frontend — React 19, Vite, TypeScript, Tailwind CSS
└── UstaGalleryServer/     # Backend  — NestJS, Bun, PostgreSQL, Prisma
```

La orquestación completa (base de datos + backend + frontend) se gestiona con Docker Compose desde la carpeta raíz.

---

## Funcionalidades por rol

| Funcionalidad                                | Público | Estudiante | Profesor | Admin |
|----------------------------------------------|:-------:|:----------:|:--------:|:-----:|
| Explorar galería pública                     |    ✓    |     ✓      |    ✓     |   ✓   |
| Ver detalle de obra y perfil de artista      |    ✓    |     ✓      |    ✓     |   ✓   |
| Filtrar por estilo artístico                 |    ✓    |     ✓      |    ✓     |   ✓   |
| Registrarse e iniciar sesión                 |    ✓    |     ✓      |    ✓     |   ✓   |
| Subir y gestionar obras propias              |         |     ✓      |    ✓     |   ✓   |
| Marcar asistencia a clase                    |         |     ✓      |          |       |
| Ver eventos y calendario del semillero       |         |     ✓      |    ✓     |   ✓   |
| Aprobar o rechazar obras con retroalimentación |       |            |    ✓     |   ✓   |
| Crear y gestionar clases con asistencia      |         |            |    ✓     |   ✓   |
| Crear y gestionar eventos                    |         |            |    ✓     |   ✓   |
| Administrar grupos de estudiantes            |         |            |    ✓     |   ✓   |
| Gestionar estilos artísticos del sistema     |         |            |          |   ✓   |
| Administrar usuarios y profesores            |         |            |          |   ✓   |

---

## Stack tecnológico

### Frontend (`UstaGalleryClient`)

| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | UI |
| TypeScript | 5.9 | Tipado estático |
| Vite | 7 | Build tool y dev server |
| Tailwind CSS | 3.4 | Estilos utilitarios |
| React Router | 7 | Enrutamiento SPA |
| Motion (Framer) | 12 | Animaciones |
| React Hook Form + Zod | 7 / 4 | Formularios y validación |
| Lucide React | — | Íconos |
| Vitest | 4 | Testing unitario |

### Backend (`UstaGalleryServer/`)

| Tecnología | Versión | Uso |
|---|---|---|
| NestJS | 11 | Framework backend |
| Bun | 1+ | Runtime y gestor de paquetes |
| PostgreSQL | 16 | Base de datos relacional |
| Prisma | 7 | ORM + migraciones |
| JWT (HttpOnly cookie) | — | Autenticación stateless |
| Swagger / OpenAPI | — | Documentación de API |
| Newman | — | Tests de API automatizados |

---

## Requisitos previos

- **Bun** v1.0+
- **Node.js** v20+ (para algunos scripts)
- **Docker** y **Docker Compose** (recomendado para entorno completo)
- **PostgreSQL** v16 (si se ejecuta sin Docker)

---

## Inicio rápido

### Con Docker (recomendado)

```bash
# Clonar ambos repositorios en la misma carpeta
git clone git@github.com:OscarCardozoDev/UstaGalleryClient.git
git clone git@github.com:OscarCardozoDev/UstaGalleryServer.git


# Levantar stack completo (DB + backend + frontend)
docker-compose -f docker-compose.dev.yml up -d

# Aplicar migraciones y seed inicial (solo primera vez)
docker exec -it backend bun run prisma:migrate:dev -- init
```

Servicios disponibles:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Swagger: http://localhost:3000/api-docs

### Desarrollo local (sin Docker)

**Backend:**
```bash
cd server
bun install
# Crear server/env/development.env con las variables requeridas
bun run start:dev        # puerto 3000
```

**Frontend:**
```bash
cd UstaGallery
bun install
# Crear UstaGallery/.env.local con VITE_API_URL=http://localhost:3000
bun run dev              # puerto 5173
```

---

## Variables de entorno

### Backend — `server/env/development.env`

```env
DATABASE_URL=postgresql://prisma:password@localhost:5432/ustagallery

JWT_SECRET=your-jwt-secret

CORS_URL_FRONT=http://localhost:5173

# UUIDs de UserTypes (se generan al ejecutar el seed)
ID_STUDENT=<uuid>
ID_PROFESSOR=<uuid>
ID_ADMIN=<uuid>
```

### Frontend — `UstaGallery/.env.local`

```env
VITE_API_URL=http://localhost:3000
```

---

---

## Comandos útiles

### Frontend

```bash
bun run dev              # servidor de desarrollo (puerto 5173)
bun run build            # build de producción
bun run lint             # ESLint
bun run test             # Vitest (unitarios)
bun run generate:types   # genera src/types/api.ts desde el backend en localhost:3000
```

### Backend

```bash
bun run start:dev                       # hot reload (puerto 3000)
bun run build                           # compilar (nest build + tsc-alias)
bun run lint                            # ESLint --fix
bun run prisma:migrate:dev -- <nombre>  # crear y aplicar migración
bun run prisma:seed:static              # poblar datos estáticos iniciales
bun run test:api                        # ejecutar colección Postman con Newman
```

### Docker Compose

```bash
docker-compose -f docker-compose.dev.yml up -d     # desarrollo completo
docker-compose -f docker-compose.test.yml up -d    # entorno de pruebas aislado
docker-compose -f docker-compose.prod.yml up -d    # producción
```

---

## Estructura del proyecto

### Frontend

```
UstaGallery/src/
├── components/        # Componentes reutilizables (ImageUploader, AnimatedList, …)
├── context/           # AuthContext — sesión de usuario y grupo activo
├── interfaces/        # Tipos TypeScript del dominio
├── pages/
│   ├── auth/          # Registro, login, creación de perfil (Stepper flow)
│   ├── dashboard/     # Panel privado — home, obras, clases, eventos, admins
│   └── public/        # Galería pública, detalle de obra
├── services/          # Llamadas fetch a la API (sin librería HTTP)
└── types/api.ts       # Generado desde OpenAPI del backend
```

### Backend — módulos

| Módulo | Ruta base | Descripción |
|---|---|---|
| `auth` | `/auth` | Registro, login, logout con JWT HttpOnly |
| `user` | `/user` | Perfiles de estudiantes y profesores |
| `groups` | `/groups` | Grupos de trabajo, gestión de miembros |
| `products` | `/products` | Obras de arte — CRUD, fotos, aprobación |
| `photos` | `/photos` | Gestión de imágenes (base64 → archivos estáticos) |
| `styles` | `/styles` | Estilos artísticos del catálogo |
| `events` | `/events` | Eventos del semillero (exposiciones, talleres, …) |
| `classes` | `/classes` | Clases con registro de asistencia |
| `roles` | `/roles` | Tipos de usuario del sistema |
| `schedule` | `/schedule` | Horarios de clases |

---

## Flujo de autenticación

1. `POST /auth/register` — crea credenciales (email + contraseña hasheada)
2. `POST /user/create` — crea el perfil de usuario vinculado al mismo UUID
3. `POST /auth/login` — valida credenciales y establece cookie JWT HttpOnly
4. Las peticiones subsiguientes envían la cookie automáticamente (`credentials: 'include'`)
5. `@Roles('student' | 'professor' | 'admin')` controla acceso por rol en cada endpoint
6. `POST /auth/logout` — elimina la cookie

---

## Flujo de publicación de obras

1. Estudiante sube obra desde `/dashboard/upload` con fotos, descripción y estilo
2. La obra queda en estado `PENDING`
3. Profesor/Admin revisa desde el panel de administración
4. Aprueba (`APPROVED`) o rechaza (`REJECTED`) con retroalimentación opcional
5. Las obras aprobadas aparecen en la galería pública

---

## API Docs

Con el backend corriendo:

```
http://localhost:3000/api-docs        # Swagger UI
http://localhost:3000/api-docs-json   # OpenAPI JSON (usado por generate:types)
```

---

## Tests

```bash
# Frontend — unitarios
cd UstaGalleryClient && bun run test

# Backend — API (requiere servidor corriendo en puerto 3000)
cd UstaGalleryServer && bun run test:api
# Reporte HTML generado en UstaGalleryServer/reports/api-test-report.html
```

---

## Repositorios

- **Frontend:** https://github.com/OscarCardozoDev/UstaGalleryClient
- **Backend:** https://github.com/OscarCardozoDev/UstaGalleryServer

---

**Universidad Santo Tomás — Tunja, Colombia**
