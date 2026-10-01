# Shopping Site Backend

Express 5 + WebSocket API for the Angular shop. Products and orders are kept in memory and
persisted atomically to `data/*.json`.

## Running

```sh
npm install
npm run dev     # watch mode
npm start       # plain run
npm test        # node:test via tsx
npm run typecheck
```

On first start a random admin password is generated and printed once; only its scrypt hash is
stored (`data/secrets.json`). Delete that file, or set `ADMIN_PASSWORD`, to change it.

| Env var                   | Default                 | Purpose                                 |
| ------------------------- | ----------------------- | --------------------------------------- |
| `PORT`                    | `3000`                  | HTTP + WebSocket port                   |
| `CORS_ORIGINS`            | `http://localhost:4200` | Comma-separated allowed browser origins |
| `ADMIN_USERNAME`          | `admin`                 | Admin login                             |
| `ADMIN_PASSWORD`          | generated               | Admin password                          |
| `JWT_SECRET`              | generated + persisted   | Token signing secret                    |
| `ADMIN_TOKEN_TTL_SECONDS` | `28800`                 | Admin session length                    |
| `DATA_DIR`                | `./data`                | Where runtime JSON is written           |

## Structure

```
src/
├── server.ts               # Composition root: wires stores, services, HTTP and WebSocket
├── app.ts                  # Express app (middleware + routers)
├── config.ts
├── controllers/            # HTTP handlers
├── routes/                 # Router factories
├── middleware/             # Validation, admin auth, security headers, errors
├── services/               # Domain logic (products, orders, auth, rate limiting) + tests
├── realtime/               # WebSocket gateway
├── infrastructure/         # Event bus, JSON file store
├── validation/             # zod schemas
├── models/
└── data/products.json      # Seed catalog (used when data/products.json doesn't exist)
```

## HTTP API

| Method | Path                | Auth  | Description                                    |
| ------ | ------------------- | ----- | ---------------------------------------------- |
| GET    | `/api/health`       |       | Status and online count                        |
| POST   | `/api/auth/login`   |       | `{ username, password }` → `{ token, ... }`    |
| GET    | `/api/auth/me`      | admin | Current admin session                          |
| GET    | `/api/products`     |       | List products                                  |
| POST   | `/api/products`     | admin | Create product                                 |
| PUT    | `/api/products/:id` | admin | Replace product                                |
| DELETE | `/api/products/:id` | admin | Delete product                                 |
| POST   | `/api/orders`       |       | Place order (prices are taken from the server) |
| GET    | `/api/orders`       | admin | List orders, newest first                      |

Admin routes take `Authorization: Bearer <token>`. Failed logins are rate limited per IP.

## WebSocket (`/ws`)

Server → client: `presence`, `product.upserted`, `product.deleted`, `order.placed` (admins only),
`auth.ok`, `auth.failed`.
Client → server: `{ "type": "auth", "token": "..." }` to receive admin events, `{ "type": "deauth" }`.
