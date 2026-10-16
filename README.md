# Nova Salud — Sistema web de gestión de inventario y ventas

Software web para la botica **Nova Salud**. Centraliza y automatiza el **inventario**, las **ventas** y la **atención al cliente**: el stock se actualiza en tiempo real, hay **alertas automáticas de reposición** cuando un producto llega a su stock mínimo, se registra cada venta y la interfaz agiliza la atención con búsqueda rápida, carrito y un asistente virtual.

> Trabajo final del curso *Fullstack Developer* (PIAD-527). La propuesta de solución, las respuestas a las preguntas guía y los diagramas están en [`docs/PROPUESTA.md`](docs/PROPUESTA.md).

---

## Contenido
1. [Funcionalidades](#funcionalidades)
2. [Arquitectura y tecnologías](#arquitectura-y-tecnologías)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Instalación y ejecución](#instalación-y-ejecución)
5. [Usuarios y roles](#usuarios-y-roles)
6. [Pruebas y control de calidad](#pruebas-y-control-de-calidad)
7. [Créditos y licencia](#créditos-y-licencia)

---

## Funcionalidades

### Inventario
- Registro, edición y baja de productos y categorías (con imagen).
- Venta por **caja** o por **blíster** (unidad fraccionada).
- **Stock mínimo por producto** (`min_stock`): al llegar a ese nivel se genera una **alerta automática de reposición** para el administrador.
- Análisis de **rotación de inventario**: velocidad de venta diaria y días restantes antes de agotarse (Saludable / Advertencia / Reponer de inmediato / Agotado).
- Productos que **requieren receta médica** identificados y bloqueados para la compra directa.

### Ventas
- Carrito y registro de pedidos con descuento de stock **atómico** (transacciones de MongoDB): nunca se vende más de lo que hay.
- Pago **contra entrega** y, opcionalmente, con tarjeta (Paymob).
- Estados del pedido: Pendiente → Enviado → Entregado / Cancelado (al cancelar se repone el stock).
- Historial de pedidos para el cliente y gestión completa para el administrador.

### Atención al cliente
- Catálogo con búsqueda, filtros (categoría, precio, receta, disponibilidad) y paginación.
- **NovaBot**, asistente virtual con IA que consulta stock, precios, carrito y estado de pedidos.
- Reseñas y calificaciones de productos, lista de favoritos y perfil del cliente.
- Panel para **repartidores**: entregas asignadas, monto a cobrar y actualización de estado.

### Panel de administración
- Ingresos, pedidos, productos, clientes, stock bajo y pedidos pendientes en tiempo real.
- Pronóstico de ingresos (regresión lineal), segmentación de clientes (K-Means / RFM) y combos de productos (Apriori). Ver [`Server/docs/ai_dashboard_documentation.md`](Server/docs/ai_dashboard_documentation.md).
- Gestión de usuarios y roles.

### Seguridad
- Contraseñas cifradas con **bcrypt** y sesiones con **JWT** en cookie `httpOnly`.
- Control de acceso por **roles** (cliente, repartidor, administrador, super administrador).
- Helmet, límite de solicitudes (rate limiting), sanitización contra inyección NoSQL, protección HPP y CORS restringido.
- Validación de todos los datos de entrada con Joi (servidor) y Zod (cliente).

---

## Arquitectura y tecnologías

| Capa | Tecnologías |
|---|---|
| **Web** (`Web/`) | React 19 + Vite, Redux Toolkit / RTK Query, React Router, React Hook Form + Zod, Tailwind CSS |
| **API** (`Server/`) | Node.js, Express 5, Mongoose (MongoDB), JWT, Joi, Swagger, Cloudinary, Groq (IA) |
| **Móvil** (`Mobile/`) | React Native 0.8x, Zustand (inicio de sesión y registro) |
| **Base de datos** | MongoDB (local o MongoDB Atlas) |
| **CI** | GitHub Actions: lint y build de Web, lint del Server y de Mobile |

```
Navegador (React)  ──HTTP/JSON──►  API REST (Express)  ──►  MongoDB
App móvil (RN)     ──HTTP/JSON──►        │
                                         ├──► Cloudinary (imágenes)
                                         ├──► Groq (asistente virtual)
                                         └──► Paymob (pago con tarjeta, opcional)
```

El diseño relacional inicial del curso está en [`database/nova_salud.sql`](database/nova_salud.sql); en [`docs/PROPUESTA.md`](docs/PROPUESTA.md) se muestra cómo cada tabla se corresponde con una colección de MongoDB.

---

## Estructura del proyecto

```text
├── Server/                  # API REST (Express + MongoDB)
│   ├── config/              # Conexión a BD, CORS, Cloudinary, IA
│   ├── middleware/          # Autenticación, roles, validación, errores, límites
│   ├── modules/             # Un módulo por dominio: Auth, Product, Category, Cart,
│   │                        #   Order, User, Review, Notification, Dashboard, Chat
│   │                        #   (controller · service · repository · model · routes · tests)
│   ├── services/            # JWT, contraseñas, IA/analítica, embeddings, pagos
│   ├── scripts/seed.js      # Datos iniciales (admin, categorías, productos)
│   └── docs/                # Swagger y documentación de la analítica
├── Web/                     # Frontend web (React + Vite)
│   └── src/                 # app (router, store), features, pages, components, utils
├── Mobile/                  # App móvil (React Native)
├── database/                # Modelo relacional inicial (SQL)
├── docs/                    # Propuesta de solución y diagramas del trabajo final
└── .github/workflows/       # Integración continua
```

---

## Instalación y ejecución

### Requisitos
- Node.js 18 o superior y npm 9 o superior.
- MongoDB local o una cadena de conexión de MongoDB Atlas. **Debe ser un replica set** (Atlas ya lo es) porque los pedidos usan transacciones.

### 1. API (Server)
```bash
cd Server
npm install
cp .env.example .env      # completa MONGO_URI y JWT_SECRET como mínimo
npm run seed              # crea el super administrador, categorías y productos de ejemplo
npm run dev               # http://localhost:4000  ·  documentación: http://localhost:4000/api-docs
```
Variables opcionales en `.env`: Cloudinary (subir imágenes), `GROQ_API_KEY` (asistente virtual), Gemini/OpenAI (búsqueda semántica) y Paymob (pago con tarjeta). Sin ellas el sistema funciona; solo esas funciones quedan desactivadas.

### 2. Web
```bash
cd Web
npm install
cp .env.example .env      # VITE_API_BASE_URL=http://localhost:4000/api
npm run dev               # http://localhost:5173
```

### 3. Móvil (opcional)
Ver [`Mobile/README.md`](Mobile/README.md).

---

## Usuarios y roles

`npm run seed` crea el **super administrador**:

| Correo | Contraseña |
|---|---|
| `admin@novasalud.pe` | `NovaSalud@2026` |

Se pueden cambiar con `SEED_ADMIN_EMAIL` y `SEED_ADMIN_PASSWORD`. **Cambia la contraseña después del primer ingreso.**

| Rol | Acceso |
|---|---|
| Cliente (`user`) | Catálogo, carrito, pedidos, reseñas, favoritos, asistente virtual |
| Repartidor (`courier`) | Entregas asignadas y actualización de su estado |
| Administrador (`admin`) | Panel, productos, categorías, pedidos, reseñas, usuarios, alertas |
| Super administrador (`super_admin`) | Todo lo anterior y gestión de administradores |

Los clientes se registran desde la web; los demás usuarios los crea un administrador desde **Panel → Usuarios**.

---

## Pruebas y control de calidad

```bash
cd Server && npm test      # 149 pruebas unitarias (Vitest)
cd Server && npm run lint
cd Web && npm run lint && npm run build
```

GitHub Actions ejecuta estas verificaciones en cada *push* y *pull request* a `main`.

---

## Créditos y licencia

Este proyecto se basa en **[Rochetta](https://github.com/aelaraby6/Rochetta)** (plataforma de farmacia en línea MERN, licencia ISC), adaptado para la botica Nova Salud: traducción completa al español, precios en soles (S/), contexto peruano, stock mínimo configurable con alertas de reposición, datos iniciales y ajustes de seguridad.
