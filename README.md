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
- **Módulo de Ingresos completo (CRUD)**, con fecha fijada automáticamente al día actual
- **Módulo de Gastos completo (CRUD)**, con validación de saldo disponible antes de crear un gasto y fecha fijada automáticamente al día actual
- **Dashboard (Home)** conectado a datos financieros reales (saldo disponible, ingreso del mes, gastos del mes)
- Gráfica de presupuesto tipo dona, construida con CSS puro (`conic-gradient` + pseudo-elemento), sin librerías externas
- **Módulo de Reportes**, con gráficas comparativas y de tendencia (ver sección [Módulo de Reportes](#módulo-de-reportes))
- Cierre de sesión automático por inactividad
- Diseño responsive con identidad visual propia de Finora

---

## Tecnologías utilizadas

### Frontend
- Angular 22 (standalone components, **modo zoneless** — sin `zone.js`)
- TypeScript
- HTML5 / CSS3
- Angular Forms
- Angular Router
- RxJS
- `@swimlane/ngx-charts` + `d3` (gráficas del módulo de Reportes)

### Backend
- Node.js
- Express
- TypeScript
- JWT (jsonwebtoken)
- bcrypt
- PostgreSQL
- pg (driver de conexión / pool)

### Herramientas
- **pnpm** (gestor de paquetes, monorepo)
- Git / GitHub
- Visual Studio Code

> ⚠️ **Importante:** este es un monorepo administrado con `pnpm`. No usar `npm install` en ninguna parte del proyecto (ni en la raíz ni en `apps/frontend` o `apps/backend`), ya que puede romper el `pnpm-workspace.yaml` y generar `package-lock.json` conflictivos con `pnpm-lock.yaml`.

---

## Nota técnica: Angular zoneless (Angular 22 sin `zone.js`)

El frontend corre **sin `zone.js`**, usando la detección de cambios basada en **Signals** de Angular. Esto afecta directamente cómo se debe escribir cualquier componente nuevo:

- **No usar propiedades planas** (`miVariable = 0`) esperando que la vista se actualice sola — sin `zone.js`, Angular no detecta esos cambios automáticamente.
- **Usar `signal()` y `computed()`** para cualquier estado que se muestre en el template. Ejemplo real del módulo de Reportes:
  ```ts
  ingresos = signal<Ingreso[]>([]);
  gastos = signal<Gasto[]>([]);

  totalIngresos = computed(() =>
    this.ingresos().reduce((acc, i) => acc + Number(i.monto), 0)
  );
  ```
- Cualquier librería de terceros que dependa de `zone.js` para refrescar la UI (como las animaciones internas de `ngx-charts`) puede requerir configuración adicional — ver [Módulo de Reportes](#módulo-de-reportes).

Si al agregar un componente nuevo la vista "no se actualiza" aunque los datos sí cambiaron, la causa más probable es que se esté usando una propiedad normal en vez de un `signal`.

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
│       │   ├── guards/
│       │   │   └── auth.guard.ts
│       │   ├── interceptors/
│       │   │   └── auth.interceptor.ts
│       │   ├── pages/
│       │   │   ├── login/
│       │   │   ├── register/
│       │   │   ├── home/
│       │   │   ├── ingresos/
│       │   │   │   └── nuevo-ingreso.ts
│       │   │   ├── gastos/
│       │   │   │   └── nuevo-gasto.ts
│       │   │   └── reportes/
│       │   │       └── reportes.ts
│       │   ├── services/
│       │   │   ├── auth.ts
│       │   │   ├── ingreso.service.ts
│       │   │   ├── gasto.service.ts
│       │   │   ├── inactivity.service.ts
│       │   │   └── idle.service.ts
│       │   ├── app.ts / app.html / app.css
│       │   ├── app.config.ts
│       │   └── app.routes.ts
│       ├── angular.json
│       ├── package.json
│       └── tsconfig.json
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

> **Convención de nombres:** los componentes ya **no** llevan el sufijo `.component` (ej. `reportes.ts`, `nuevo-gasto.ts`), a diferencia del esquema clásico de Angular (`reportes.component.ts`). Al crear un componente nuevo, seguir este patrón corto para mantener consistencia con el resto del proyecto.

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

El frontend guarda `token` y `user` en `localStorage`. El interceptor `auth.interceptor.ts` adjunta el token automáticamente a cada petición saliente (no hay que agregarlo manualmente en cada servicio), y el middleware `authenticateToken` protege todas las rutas de Ingresos, Gastos, Home y Reportes en el backend, inyectando `req.user.userId`.

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

> La `fecha` que llega en el body corresponde siempre al día actual: el formulario del frontend ya no permite editarla manualmente (ver [Restricción de fechas](#restricción-de-fechas-en-gastos-e-ingresos)).

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

> El módulo de Reportes reutiliza los endpoints de `/api/ingresos` y `/api/gastos` ya existentes; no se agregó un endpoint `/api/reportes` nuevo, ya que el frontend agrupa y calcula los totales por mes en el propio componente usando `computed()`.

---

## Rutas del frontend (`http://localhost:4200`)

| Ruta | Descripción |
|---|---|
| `/login` | Inicio de sesión con correo y contraseña |
| `/register` | Registro de una cuenta nueva |
| `/home` | Dashboard: saldo, ingreso y gasto del mes, movimientos recientes, gráfica de dona, accesos rápidos |
| `/ingresos` | Listado, alta (modal) y eliminación de ingresos, con fecha fijada al día actual |
| `/gastos` | Mismo comportamiento que Ingresos, con categorías propias, validación de saldo al crear y fecha fijada al día actual |
| `/reportes` | Gráficas comparativas de Ingresos vs. Gastos y tendencia histórica, protegida con `authGuard` |

---

## Restricción de fechas en Gastos e Ingresos

En los formularios de **Nuevo Ingreso** y **Nuevo Gasto**, el campo de fecha dejó de ser un `<input type="date">` editable. Ahora se muestra como **texto de solo lectura**, fijado automáticamente a la fecha del día en que se está registrando el movimiento (`new Date()` en el momento de abrir el formulario).

**Objetivo:** evitar que el usuario registre ingresos o gastos con fechas pasadas o futuras, lo cual mantiene el historial y los reportes consistentes con la actividad real del día a día.

---

## Control de inactividad de sesión

Finora cierra la sesión del usuario automáticamente después de **30 minutos de inactividad** (sin clics, movimiento del mouse o teclado). Existen dos servicios relacionados con este comportamiento en el código:

| Servicio | Comportamiento | Estado |
|---|---|---|
| `InactivityService` | Muestra un **modal de aviso** con una cuenta regresiva de gracia antes de cerrar la sesión, dando al usuario la opción de continuar activo | ✅ **Activo en producción** |
| `IdleService` | Cierra la sesión **directamente**, sin ningún aviso previo | ⚠️ No activo (implementación alternativa / de referencia) |

> Si tu configuración real usa `IdleService` como el activo, o ambos coexisten para casos distintos, actualiza esta tabla — quedó documentada con `InactivityService` como el flujo actualmente habilitado.

---

## Módulo de Reportes

Ruta protegida: **`/reportes`** (requiere `authGuard`).

### Qué incluye

- **Gráfica de barras** comparativa de **Ingresos vs. Gastos**, agrupada por mes.
- **Gráfica de línea** de tendencia histórica, visible únicamente cuando existen datos de **2 o más meses distintos** (con un solo mes, una línea de tendencia no aporta información).
- Listas de **"Ingresos Realizados"** y **"Gastos Recientes"** al costado de la gráfica principal, con el mismo estilo visual que las listas del Home.
- Botón **"Regresar al Dashboard"**.

Ambas gráficas se construyeron con **`@swimlane/ngx-charts`** (sobre **`d3`**), en vez de reutilizar el enfoque CSS puro de la dona del Home, ya que ngx-charts maneja mejor ejes, leyendas y series múltiples.

### Detalles de implementación

- El componente usa **Angular Signals** (`signal`, `computed`) en lugar de propiedades normales para todo su estado — indispensable en este proyecto por ser **zoneless** (ver [nota técnica de Angular zoneless](#nota-técnica-angular-zoneless-angular-22-sin-zonejs)).
- Se instalaron las dependencias nuevas `@swimlane/ngx-charts` y `d3`.
- Fue necesario agregar `provideAnimationsAsync()` en `app.config.ts`, ya que ngx-charts depende internamente de animaciones de Angular para sus transiciones (entrada de barras, tooltips, etc.), y sin `zone.js` estas no se activaban por defecto:
  ```ts
  // app.config.ts
  providers: [
    // ...otros providers
    provideAnimationsAsync(),
  ]
  ```

### Posibles mejoras futuras

- Tarjetas de totales del mes (ingresos, gastos, balance) arriba de las gráficas.
- Top 5 de gastos más altos del período visible.
- Gráfica adicional de distribución por categoría (tipo dona o barras horizontales).
- Exportar el reporte a **PDF** o **CSV**.
- Filtro de rango de fechas para las gráficas y las listas.

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

> No usar `npm install` en ningún subdirectorio: el proyecto es un monorepo `pnpm` y mezclar gestores de paquetes puede corromper el lockfile.

---

## Pruebas sugeridas

1. **Login admin** — `admin@finora.com` / `Admin123` → debe iniciar sesión con rol `ADMIN`.
2. **Registro** — crear un usuario (ej. Marcos / marcos@gmail.com / 123456) desde `/register`.
3. **Login normal** — iniciar sesión con esas credenciales; Angular guarda el JWT y redirige a `/home`.
4. **Registrar un ingreso** — en `/ingresos`, agregar uno nuevo; la fecha debe mostrarse fija en el día actual, y el registro debe aparecer al tope de la lista sin recargar y reflejarse en el Home.
5. **Registrar un gasto dentro del saldo** — en `/gastos`, con un monto menor al saldo disponible; debe aparecer en la lista y reducir el saldo del Home.
6. **Gasto que excede el saldo** — repetir con un monto mayor; el backend debe rechazarlo y el modal mostrar `"Fondos insuficientes..."` sin cerrarse.
7. **Reportes con un solo mes de datos** — entrar a `/reportes` con movimientos de un único mes; la gráfica de barras debe mostrarse, pero la de tendencia histórica debe permanecer oculta.
8. **Reportes con 2+ meses de datos** — registrar movimientos en al menos dos meses distintos; la gráfica de tendencia debe aparecer junto a la de barras.
9. **Inactividad** — dejar la sesión inactiva por 30 minutos; debe aparecer el modal de aviso con cuenta regresiva antes de cerrar sesión automáticamente.

---

## Seguridad

**Implementado:** bcrypt para contraseñas, JWT para autenticación, variables de entorno para secretos, roles `USER`/`ADMIN`, validación de datos en el backend, filtrado de todos los recursos por `usuario_id` del token, validación de saldo disponible antes de crear un gasto, cierre de sesión automático por inactividad (30 minutos), fecha de movimientos fijada al día actual (no editable) en Ingresos y Gastos.

**Pendiente para producción:** refresh tokens, expiración configurable de sesión, Guards de Angular en todas las rutas sensibles, middleware de autorización por rol, validaciones más completas, protección contra fuerza bruta, HTTPS, CORS de producción, variables de entorno separadas por ambiente.

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
Login → Register → Home ←→ Gastos ←→ Ingresos ←→ Reportes
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
- El componente mantiene su estado en **Signals** (`signal`, `computed`) en vez de propiedades planas, ya que la app corre en **modo zoneless** (sin `zone.js`) y depende de Signals para que la vista se actualice.
- Rutas protegidas (`/reportes`, entre otras) usan **`authGuard`** a nivel de `app.routes.ts`.
- Los archivos de componente **no** llevan el sufijo `.component` (ej. `reportes.ts`).

---

## Próximas funcionalidades

**Gastos / Ingresos:** editar registros existentes, filtrar por categoría o rango de fechas.

**Presupuesto:** definir si es configurable por el usuario o fijo, conectar completamente el valor en el backend, permitir presupuestos por categoría, por ejemplo:
```text
Alimentación     → Q 500
Transporte       → Q 300
Entretenimiento  → Q 200
```

**Reportes (mejoras sobre el módulo ya implementado):** tarjetas de totales del mes, top 5 de gastos, gráfica de distribución por categoría, exportación a PDF/CSV, filtro de rango de fechas.

**Dashboard:** gráficos adicionales de tendencia (ingresos vs. gastos por mes) — parcialmente cubierto ya por el módulo de Reportes.

**Otros:** Guards de autenticación en todas las rutas sensibles de Angular, permisos por rol, perfil de usuario, pantalla de configuración.

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
[✓] Módulo de Reportes (gráfica comparativa + tendencia histórica)
[✓] Fecha fija (solo lectura) en formularios de Ingresos y Gastos
[✓] Cierre de sesión automático por inactividad (30 min)

[ ] Definir origen del valor de "presupuesto" (fijo vs. configurable)
[ ] Categorías con presupuesto individual
[ ] Mejoras al módulo de Reportes (totales del mes, top 5 gastos, categorías, exportar PDF/CSV, filtro de fechas)
[ ] Guards de autenticación y permisos por rol en todas las rutas de Angular
[ ] Edición de ingresos y gastos existentes
[ ] Perfil de usuario y configuración
```

---

## Estado actual

El sistema cuenta con autenticación completa y los módulos de **Ingresos**, **Gastos**, **Dashboard (Home)** y **Reportes** funcionando de extremo a extremo, conectados a datos reales de PostgreSQL:

```text
Usuario → Register / Login → JWT → Home (Dashboard)
                                      ├──→ Gastos    (crear / listar / eliminar, con validación de saldo)
                                      ├──→ Ingresos  (crear / listar / eliminar)
                                      └──→ Reportes  (gráfica comparativa + tendencia histórica)
```

La siguiente etapa consiste en definir el concepto de **presupuesto configurable** y ampliar el **módulo de Reportes** con las mejoras listadas en [Próximas funcionalidades](#próximas-funcionalidades).

---

**Proyecto:** Finora — control de gastos personales
**Arquitectura:** Frontend + Backend + Base de datos
**Stack:** Angular 22 (zoneless) + TypeScript · Node.js + Express + TypeScript · PostgreSQL · JWT + bcrypt · ngx-charts + d3