# Resortify · Heritage Seaside Resort

Where stays become stories.

A heritage seaside resort booking system — TypeScript, MongoDB, React, NestJS. Built to feel like a real brand, not a template.

## Stack

- **Server** — NestJS 10, Mongoose 8, JWT, bcrypt, class-validator
- **Client** — React 18, Vite, Tailwind CSS v4, React Router 6
- **Database** — MongoDB (dev via `mongodb-memory-server`)

## Quick start

```bash
# server
cd server
npm install
npm run dev:mem   # boots in-memory Mongo + seeds demo data

# client (separate terminal)
cd client
npm install
npm run dev       # http://localhost:5174 (proxies /api → :4000)
```

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin (concierge) | `admin@resortify.dev` | `AdminPass123!` |
| Guest | `demo@resortify.dev` | `DemoPass123!` |

## Design

- **Palette** — cream, ink, pine, brass, sand
- **Type** — Fraunces (serif display), Manrope (body), IBM Plex Mono (labels)
- **Motifs** — rate-card format, brass underline, luggage-tag reference codes, hairline borders
- **Theme** — light-first, dark pine theme via toggle

See `DESIGN.md` for the full brand spec.

## API

```
POST   /api/auth/register        — create account
POST   /api/auth/login           — get access token
GET    /api/auth/me               — current user

GET    /api/rooms                 — all rooms
GET    /api/rooms/:id             — single room
GET    /api/rooms/available       — ?checkIn=&checkOut=&guests=
POST   /api/rooms                 — create (admin)
PUT    /api/rooms/:id             — update (admin)
DELETE /api/rooms/:id             — delete (admin)

GET    /api/reservations          — guest: my stays / admin: all
POST   /api/reservations          — book a room
GET    /api/reservations/:id      — single reservation
PUT    /api/reservations/:id      — update dates/guests
PUT    /api/reservations/:id/status — change status
GET    /api/reservations/metrics  — dashboard stats (admin)

GET    /api/users                 — guest list (admin)
PATCH  /api/users/:id/role        — promote/demote (admin)
```
