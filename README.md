# Finora

Aplicación web para el **control y administración de gastos personales**.

Finora nace como proyecto académico orientado al desarrollo de una aplicación web escalable, donde los usuarios pueden registrarse, iniciar sesión y administrar sus finanzas desde una interfaz moderna. Está desarrollado utilizando **Angular, TypeScript, Node.js, Express y PostgreSQL**.

---

## Descripción

El sistema cuenta con autenticación de usuarios mediante **JWT**, almacenamiento de contraseñas con **bcrypt** y una base de datos **PostgreSQL**.

### Funcionalidades actuales

- Registro de usuarios
- Inicio de sesión
- Autenticación mediante JWT
- Roles de usuario (`USER` / `ADMIN`)
- Usuario administrador predeterminado, creado automáticamente al iniciar el backend si no existe
- Conexión con PostgreSQL
- Frontend en Angular, backend en Node.js + Express
- Navegación entre Login, Register y Home
- **Módulo de Ingresos completo (CRUD)**
- **Módulo de Gastos completo (CRUD)**, con validación de saldo disponible antes de crear un gasto
- **Dashboard (Home)** conectado a datos financieros reales (saldo disponible, ingreso del mes, gastos del mes)
- Gráfica de presupuesto tipo dona, construida con CSS puro (`conic-gradient` + pseudo-elemento), sin librerías externas
- Diseño responsive con identidad visual propia de Finora

---

## Tecnologías utilizadas

### Frontend
- Angular (standalone components)
- TypeScript
- HTML5 / CSS3
- Angular Forms
- Angular Router
- RxJS

### Backend
- Node.js
- Express
- TypeScript
- JWT (jsonwebtoken)
- bcrypt
- PostgreSQL
- pg (driver de conexión / pool)

### Herramientas
- pnpm (gestor de paquetes, monorepo)
- Git / GitHub
- Visual Studio Code

---

## Estructura del proyecto

```text
Finora/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   │   ├── database.ts
│   │   │   │   ├── createUsersTable.ts
│   │   │   │   ├── createIngresosTable.ts
│   │   │   │   └── createGastosTable.ts
│   │   │   ├── controllers/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── Ingreso.controller.ts
│   │   │   │   ├── Gasto.controller.ts
│   │   │   │   └── home.controller.ts
│   │   │   ├── middlewares/
│   │   │   │   └── auth.middleware.ts
│   │   │   ├── models/
│   │   │   │   └── user.model.ts
│   │   │   ├── routes/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── ingreso.routes.ts
│   │   │   │   ├── gasto.routes.ts
│   │   │   │   └── home.routes.ts
│   │   │   ├── services/
│   │   │   │   └── auth.service.ts
│   │   │   ├── server.ts
│   │   │   └── app.ts
│   │   ├── dist/
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── frontend/
│       ├── src/app/
│       │   ├── interceptors/
│       │   │   └── auth.interceptor.ts
│       │   ├── pages/
│       │   │   ├── login/
│       │   │   ├── register/
│       │   │   ├── home/
│       │   │   ├── ingresos/
│       │   │   │   └── nuevo-ingreso.ts
│       │   │   └── gastos/
│       │   │       └── nuevo-gasto.ts
│       │   ├── services/
│       │   │   ├── auth.ts
│       │   │   ├── ingreso.service.ts
│       │   │   └── gasto.service.ts
│       │   ├── app.ts / app.html / app.css
│       │   └── app.routes.ts
│       ├── angular.json
│       ├── package.json
│       └── tsconfig.json
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

---

## Base de datos

El proyecto utiliza **PostgreSQL**. Las tablas actuales son `users`, `ingresos` y `gastos`.

**users**
```text
id, name, email, password (hash bcrypt), role, created_at
```
Roles disponibles: `USER`, `ADMIN`. Las contraseñas nunca se guardan en texto plano: se hashean con bcrypt antes de insertarse.

**ingresos / gastos** (comparten el mismo esquema, para que el CRUD se comporte igual en ambos módulos)
```text
id, usuario_id (FK → users.id), descripcion, monto, fecha, categoria
```
Cada fila pertenece a un único usuario. El backend siempre filtra por `usuario_id`, tomado del token JWT — nunca de un valor enviado por el frontend —, así ningún usuario puede leer, crear o eliminar movimientos de otra cuenta aunque manipule las peticiones HTTP directamente.

---

## Autenticación

Finora usa **JSON Web Tokens (JWT)**. Al iniciar sesión correctamente, el backend responde con el token y los datos básicos del usuario:

```json
{
  "token": "JWT_TOKEN",
  "user": { "id": 2, "name": "Marcos", "email": "marcos@gmail.com", "role": "USER" }
}
```

El frontend guarda `token` y `user` en `localStorage`. El interceptor `auth.interceptor.ts` adjunta el token automáticamente a cada petición saliente (no hay que agregarlo manualmente en cada servicio), y el middleware `authenticateToken` protege todas las rutas de Ingresos, Gastos y Home en el backend, inyectando `req.user.userId`.

**Usuarios para probar:**

| Rol | Correo | Contraseña | Origen |
|---|---|---|---|
| ADMIN | `admin@finora.com` | `Admin123` | Se crea solo al arrancar el backend |
| USER | el que registres | el que definas | Se crea desde `/register` |

> Estas credenciales son solo para desarrollo. En producción no deben quedar hardcodeadas ni usar contraseñas tan simples.

---

## Rutas del backend (`http://localhost:3000`)

### Auth — `/api/auth`

**Registrar usuario** — `POST /api/auth/register`
```json
// Body
{ "name": "Marcos", "email": "marcos@gmail.com", "password": "123456" }

// Respuesta
{
  "message": "Usuario registrado correctamente",
  "user": { "id": 2, "name": "Marcos", "email": "marcos@gmail.com", "role": "USER" }
}
```

**Iniciar sesión** — `POST /api/auth/login`
```json
// Body
{ "email": "marcos@gmail.com", "password": "123456" }

// Respuesta
{
  "token": "JWT_TOKEN",
  "user": { "id": 2, "name": "Marcos", "email": "marcos@gmail.com", "role": "USER" }
}
```

### Ingresos — `/api/ingresos` (requiere JWT)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/ingresos` | Lista los ingresos del usuario autenticado |
| POST | `/api/ingresos` | Crea un nuevo ingreso |
| DELETE | `/api/ingresos/:id` | Elimina un ingreso, validando que sea del dueño |

```json
// Body de creación
{ "descripcion": "Salario", "monto": 5000, "fecha": "2026-09-01", "categoria": "Trabajo" }
```

### Gastos — `/api/gastos` (requiere JWT)

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/gastos` | Lista los gastos del usuario autenticado |
| POST | `/api/gastos` | Crea un nuevo gasto, validando saldo disponible |
| DELETE | `/api/gastos/:id` | Elimina un gasto, validando que sea del dueño |

```json
// Body de creación
{ "descripcion": "Almuerzo", "monto": 45.50, "fecha": "2026-09-09", "categoria": "Comida" }
```

Antes de insertar un gasto, el backend calcula el saldo real (`SUM(ingresos) − SUM(gastos)` de todo el historial). Si el monto excede ese saldo, responde con:

```json
{ "mensaje": "Fondos insuficientes. Tu saldo disponible es Q1250.00." }
```

y no crea el registro. Esta validación vive en el backend —no solo en el frontend— para que se cumpla sin importar si la petición viene de un formulario, curl o Postman.

### Home / Dashboard — `/api/home` (requiere JWT)

```json
{ "presupuesto": 8500.00, "gastado": 1230.50, "saldoDisponible": 4260.00 }
```

- `saldoDisponible`: histórico de ingresos menos gastos.
- `gastado`: suma de gastos del mes y año actuales.
- `presupuesto`: por ahora es un valor fijo, usado solo para calcular el porcentaje de la gráfica de dona — pendiente de definir si será configurable.

---

## Rutas del frontend (`http://localhost:4200`)

| Ruta | Descripción |
|---|---|
| `/login` | Inicio de sesión con correo y contraseña |
| `/register` | Registro de una cuenta nueva |
| `/home` | Dashboard: saldo, ingreso y gasto del mes, movimientos recientes, gráfica de dona, accesos rápidos |
| `/ingresos` | Listado, alta (modal) y eliminación de ingresos |
| `/gastos` | Mismo comportamiento que Ingresos, con categorías propias y validación de saldo al crear |

---

## Instalación y ejecución

```bash
git clone URL_DEL_REPOSITORIO
cd Finora
pnpm install
```

Crear la base de datos (ej. `finora`) y configurar `apps/backend/.env` (agregado a `.gitignore`, no debe subirse a GitHub):

```env
PORT=3000
DATABASE_URL=postgresql://postgres:TU_PASSWORD@localhost:5432/finora
JWT_SECRET=una_clave_secreta_para_desarrollo
```

**Terminal 1 — Backend**
```bash
cd apps/backend
pnpm install
pnpm build
pnpm start
```
Si todo funciona debería aparecer:
```text
Base de datos conectada
El administrador ya existe
Backend iniciado en http://localhost:3000
```
> `pnpm start` ejecuta `node dist/server.js` — **no** corre en modo watch. Cualquier cambio en `src/` requiere volver a correr `pnpm build` antes de `pnpm start`, o el servidor seguirá respondiendo con el código compilado anterior.

**Terminal 2 — Frontend**
```bash
cd apps/frontend
pnpm install
pnpm start   # o: ng serve
```
Disponible en `http://localhost:4200`. A diferencia del backend, sí corre en modo watch: los cambios en `.ts`, `.html` o `.css` se recargan automáticamente.

---

## Pruebas sugeridas

1. **Login admin** — `admin@finora.com` / `Admin123` → debe iniciar sesión con rol `ADMIN`.
2. **Registro** — crear un usuario (ej. Marcos / marcos@gmail.com / 123456) desde `/register`.
3. **Login normal** — iniciar sesión con esas credenciales; Angular guarda el JWT y redirige a `/home`.
4. **Registrar un ingreso** — en `/ingresos`, agregar uno nuevo; debe aparecer al tope de la lista sin recargar y reflejarse en el Home.
5. **Registrar un gasto dentro del saldo** — en `/gastos`, con un monto menor al saldo disponible; debe aparecer en la lista y reducir el saldo del Home.
6. **Gasto que excede el saldo** — repetir con un monto mayor; el backend debe rechazarlo y el modal mostrar `"Fondos insuficientes..."` sin cerrarse.

---

## Seguridad

**Implementado:** bcrypt para contraseñas, JWT para autenticación, variables de entorno para secretos, roles `USER`/`ADMIN`, validación de datos en el backend, filtrado de todos los recursos por `usuario_id` del token, validación de saldo disponible antes de crear un gasto.

**Pendiente para producción:** refresh tokens, expiración configurable de sesión, Guards de Angular, middleware de autorización por rol, validaciones más completas, protección contra fuerza bruta, HTTPS, CORS de producción, variables de entorno separadas por ambiente.

---

## Diseño

La interfaz busca transmitir finanzas, organización, seguridad, simplicidad y modernidad. Paleta:

```text
Verde  → Finanzas / crecimiento / ingresos
Oscuro → Seguridad / confianza
Blanco → Limpieza / simplicidad
Morado → Elementos secundarios (gráficas)
Rojo   → Gastos / salidas de dinero
```

Flujo entre pantallas:
```text
Login → Register → Home ←→ Gastos ←→ Ingresos
```

---

## Arquitectura

**Backend:**
```text
Routes → Middleware (authenticateToken) → Controllers → Database (pool pg)
```
- **Routes:** define los endpoints (`POST /register`, `GET /api/gastos`, etc.)
- **Middlewares:** `authenticateToken` valida el JWT en rutas protegidas e inyecta `req.user.userId`
- **Controllers:** reciben la solicitud, ejecutan la lógica de negocio (incluida la validación de saldo) y responden
- **Services (auth):** `registerUser()`, `loginUser()`
- **Database:** comunicación con PostgreSQL vía pool de conexiones (`pg`)

**Frontend:** cada módulo sigue el mismo patrón:
```text
Componente (.ts + .html + .css) → Service (*.service.ts) → HttpClient → Backend
```

---

## Próximas funcionalidades

**Gastos / Ingresos:** editar registros existentes, filtrar por categoría o rango de fechas.

**Presupuesto:** definir si es configurable por el usuario o fijo, conectar completamente el valor en el backend, permitir presupuestos por categoría, por ejemplo:
```text
Alimentación     → Q 500
Transporte       → Q 300
Entretenimiento  → Q 200
```

**Reportes:** definir el alcance (hoy es un placeholder), historial de movimientos filtrable, exportación a PDF / Excel.

**Dashboard:** gráficos adicionales de tendencia (ingresos vs. gastos por mes).

**Otros:** Guards de autenticación en Angular, permisos por rol, perfil de usuario, pantalla de configuración.

---

## Roadmap

```text
[✓] Configuración inicial del proyecto
[✓] Backend con Express
[✓] Conexión PostgreSQL
[✓] Modelo de usuarios, registro y login
[✓] bcrypt + JWT
[✓] Roles USER / ADMIN + usuario administrador
[✓] Frontend Angular: Login, Register, Home
[✓] Navegación entre páginas + diseño visual
[✓] CRUD de ingresos
[✓] CRUD de gastos + validación de saldo disponible
[✓] Dashboard financiero conectado a datos reales
[✓] Gráfica de presupuesto (dona) en el Home

[ ] Definir origen del valor de "presupuesto" (fijo vs. configurable)
[ ] Categorías con presupuesto individual
[ ] Módulo de Reportes + historial de movimientos filtrable
[ ] Guards de autenticación y permisos por rol en Angular
[ ] Edición de ingresos y gastos existentes
[ ] Perfil de usuario y configuración
```

---

## Estado actual

El sistema cuenta con autenticación completa y los módulos de **Ingresos**, **Gastos** y **Dashboard (Home)** funcionando de extremo a extremo, conectados a datos reales de PostgreSQL:

```text
Usuario → Register / Login → JWT → Home (Dashboard)
                                      ├──→ Gastos   (crear / listar / eliminar, con validación de saldo)
                                      └──→ Ingresos (crear / listar / eliminar)
```

La siguiente etapa consiste en definir el concepto de **presupuesto configurable** y construir el **módulo de Reportes**, que completarán el núcleo funcional de Finora.

---

**Proyecto:** Finora — control de gastos personales
**Arquitectura:** Frontend + Backend + Base de datos
**Stack:** Angular + TypeScript · Node.js + Express + TypeScript · PostgreSQL · JWT + bcrypt