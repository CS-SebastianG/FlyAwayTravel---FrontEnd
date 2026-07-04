# Fly Away Travel — Frontend

SPA en React + TypeScript (Vite) que consume la API de reserva de vuelos **Fly Away** (backend Spring Boot, `http://localhost:8080`).

## Requisitos

- Node.js 18+
- El backend corriendo en `http://localhost:8080` (ver el README del backend: `./mvnw spring-boot:run`)

## Instalación y ejecución

```bash
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`.

## Funcionalidades implementadas

| Pantalla | Estado |
|---|---|
| Registro (`POST /users/register`) | validación de campos vacíos, muestra errores del backend, redirige al login |
| Login (`POST /auth/login`) | guarda JWT en `localStorage`, muestra errores, redirige a búsqueda |
| Nombre de usuario autenticado (`GET /users/current`) | visible en la barra de navegación |
| Búsqueda de vuelos (`GET /flights/search`) | por número de vuelo / aerolínea / rango de fechas de salida, tabla de resultados, mensaje de resultado vacío |
| Reservar vuelo (`POST /flights/book`) | botón por resultado, solo si hay sesión iniciada, muestra ID de reserva o error del backend |
| Detalle de reserva (`GET /flights/book/{id}`) | usado en "Mis reservas" |
| Mis reservas | lista las reservas hechas desde este navegador (IDs guardados en `localStorage`) |
| Logout & rutas protegidas | botón de logout limpia el token; `/my-bookings` redirige a `/login` si no hay sesión |

## Notas técnicas

- El cliente HTTP (`src/api.ts`) agrega automáticamente el header `Authorization: Bearer <token>` cuando hay un token guardado.
- Los errores del backend llegan en dos formatos distintos según el tipo de excepción (`ProblemDetail` con `detail`, o texto plano de Bean Validation). `extractErrorMessage` en `src/api.ts` normaliza ambos casos para mostrar siempre un mensaje legible.
- "Mis reservas" guarda únicamente los IDs de las reservas hechas desde este navegador (no existe un endpoint `GET /flights/book?userId=` en el backend), y al cargar la pantalla pide el detalle de cada una con `GET /flights/book/{id}`.
- El backend no expone `firstName`/`lastName` en `GET /users/current` (solo `id`, `username`, `role`), por lo que se muestra el `username` (email) como nombre del usuario autenticado.

## Estructura

```
src/
├── api.ts                 # instancia de axios + manejo de errores
├── types.ts                # tipos TS que reflejan los DTOs del backend
├── auth/AuthContext.tsx    # estado de sesión (token, usuario actual)
├── components/
│   ├── Navbar.tsx
│   └── ProtectedRoute.tsx
├── pages/
│   ├── RegisterPage.tsx
│   ├── LoginPage.tsx
│   ├── SearchPage.tsx      # búsqueda + reserva
│   └── MyBookingsPage.tsx
├── App.tsx                 # rutas
└── main.tsx                # entry point
```
