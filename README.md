# NexCart

A mini e-commerce **order management platform** built as a **Java Spring Boot microservices** system with a **React + TypeScript** frontend. It demonstrates the patterns used in production microservice architectures: service discovery, an API gateway, JWT-based authentication, inter-service communication, and centralized error handling — all runnable locally with a single command.

## Architecture

```
                          +-------------------+
                          |  React Frontend   |
                          |   (Vite + TS)     |
                          |    :5173          |
                          +--------+----------+
                                   |  /api/**  (dev proxy)
                                   v
                          +--------+----------+
                          |   API Gateway     |
                          | Spring Cloud Gate.|
                          |    :8080          |
                          | + request logging |
                          +---+----------+----+
                              |          |
                 /api/users/**|          |/api/orders/**
                              v          v
                    +---------+----+  +--+--------------+
                    | user-service |  | order-service   |
                    |   :8081      |  |   :8082         |
                    | JWT auth     |--| validates JWT   |
                    | BCrypt, H2   |  | via user-service|
                    +------+-------+  +-----+-----------+
                           |                |
                           v                v
                    +------+-------+  +-----+-----------+
                    | H2 (users)   |  | H2 (orders)     |
                    +--------------+  +-----------------+

   All services register with:

                    +-------------------+
                    |  Eureka Server    |
                    |  :8761            |
                    +-------------------+
```

**Service responsibilities**

| Service | Port | Role |
|---|---|---|
| `eureka-server` | 8761 | Service discovery (Netflix Eureka). Dashboard at `/` |
| `api-gateway` | 8080 | Single entry point. Routes `/api/users/**` → user-service, `/api/orders/**` → order-service via Eureka (`lb://`). Global request-logging filter (method, path, status, latency) |
| `user-service` | 8081 | Registration, login, JWT issuance (jjwt, HS256), BCrypt password hashing, `GET /api/users/me` profile endpoint. H2 database |
| `order-service` | 8082 | Order CRUD + status state machine. Validates every request by calling user-service's `/me` with the caller's JWT (Eureka-aware `@LoadBalanced` `RestTemplate`). H2 database |
| `frontend` | 5173 | React 18 + TypeScript (Vite). Login/register, dashboard, order list, order creation. JWT in memory + `localStorage`, Axios auth interceptor, auto-logout on 401 |

## Tech Stack

**Backend:** Java 17 · Spring Boot 3.2 · Spring Cloud 2023.0 (Eureka, Gateway, LoadBalancer) · Spring Security 6 (stateless JWT) · Spring Data JPA · Hibernate Validator · jjwt 0.12.5 · H2 · Actuator

**Frontend:** React 18 · TypeScript 5 · Vite 5 · React Router 6 · Axios (JWT interceptors) · plain modern CSS (no UI framework)

**Ops:** Docker multi-stage builds · Docker Compose with healthchecks

## Quick Start (Docker Compose)

Prerequisites: Docker + Docker Compose.

```bash
cd nexcart
docker compose up --build
```

This builds and starts all four backend services. Then in a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open:
- Frontend: http://localhost:5173
- Eureka dashboard: http://localhost:8761
- Gateway: http://localhost:8080

> The default JWT secret is a dev-only value. For anything beyond local demos, set `JWT_SECRET` (min 32 characters) in your environment before `docker compose up`.

## Run Manually (without Docker)

Prerequisites: Java 17, Maven 3.9+, Node 18+.

Start in this order (each service registers with Eureka, so the registry must be up first):

```bash
# 1. Service discovery
cd eureka-server && mvn spring-boot:run

# 2. Backend services (each in its own terminal)
cd user-service && mvn spring-boot:run
cd order-service && mvn spring-boot:run
cd api-gateway && mvn spring-boot:run

# 3. Frontend
cd frontend && npm install && npm run dev
```

For manual runs everything uses the `localhost` defaults in each `application.yml`, so no extra configuration is needed.

## API Reference

All calls go through the gateway at `http://localhost:8080`.

### Users (`user-service`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/users/register` | No | Register. Body: `{username, email, password}` → `201` + `{token, tokenType, username, email}` |
| POST | `/api/users/login` | No | Login with `{usernameOrEmail, password}` → `200` + JWT |
| GET | `/api/users/me` | JWT | Current user profile |

### Orders (`order-service`)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/orders` | JWT | Create order. Body: `{items: [{productName, quantity, unitPrice}]}` → `201` |
| GET | `/api/orders` | JWT | List my orders (newest first) |
| GET | `/api/orders/{id}` | JWT | Get one of my orders (404 if not mine) |
| PUT | `/api/orders/{id}/status` | JWT | Update status. Body: `{status: PENDING\|CONFIRMED\|SHIPPED\|DELIVERED\|CANCELLED}` |

### Example

```bash
# Register
curl -s -X POST localhost:8080/api/users/register \
  -H 'Content-Type: application/json' \
  -d '{"username":"demo","email":"demo@nexcart.dev","password":"password123"}'

# Save the token, then create an order
TOKEN=<token-from-above>
curl -s -X POST localhost:8080/api/orders \
  -H "Authorization: Bearer $TOKEN" -H 'Content-Type: application/json' \
  -d '{"items":[{"productName":"Wireless Headphones","quantity":1,"unitPrice":89.99}]}'

# List my orders
curl -s localhost:8080/api/orders -H "Authorization: Bearer $TOKEN"
```

Error responses are consistent JSON: `{timestamp, status, error, message, path, fieldErrors?}`.

## JWT Auth Flow

1. `POST /api/users/register` (or `/login`) → user-service hashes the password with **BCrypt**, persists the user in H2, and returns a signed **JWT** (HS256, 24h expiry) containing `sub` (username), `userId`, and `role` claims.
2. The React app stores the token in memory + `localStorage`. An Axios request interceptor attaches it as `Authorization: Bearer <token>` on every API call.
3. `JwtAuthenticationFilter` in user-service validates the signature/expiry and builds a `UserPrincipal` from the claims — no database lookup per request.
4. For order endpoints, order-service forwards the same `Authorization` header to user-service's `GET /api/users/me` via a Eureka-aware `@LoadBalanced` `RestTemplate`. A `200` both authenticates the caller and identifies the order owner; a `401/403` becomes a `401` to the client, and an unreachable user-service becomes a `503`.
5. On any `401`, the frontend interceptor clears the stored token and redirects to `/login`.

## Project Structure

```
nexcart/
├── eureka-server/          # Service discovery (:8761)
├── api-gateway/            # Routing + global logging filter (:8080)
│   └── src/main/java/com/nexcart/gateway/filter/RequestLoggingFilter.java
├── user-service/           # Auth + users (:8081)
│   └── src/main/java/com/nexcart/user/
│       ├── controller/     # AuthController, UserController
│       ├── service/        # UserService, JwtService
│       ├── config/         # SecurityConfig, JwtAuthenticationFilter, UserPrincipal
│       ├── repository/     # UserRepository
│       ├── dto/            # RegisterRequest, LoginRequest, AuthResponse, UserDto
│       ├── entity/         # User
│       └── exception/      # GlobalExceptionHandler, ErrorResponse, ...
├── order-service/          # Orders (:8082)
│   └── src/main/java/com/nexcart/order/
│       ├── controller/     # OrderController
│       ├── service/        # OrderService (ownership checks, status state machine)
│       ├── client/         # UserServiceClient (validates JWT via user-service)
│       ├── config/         # AppConfig (@LoadBalanced RestTemplate)
│       ├── repository/     # OrderRepository
│       ├── dto/            # CreateOrderRequest, OrderDto, ...
│       ├── entity/         # Order, OrderItem, OrderStatus
│       └── exception/      # GlobalExceptionHandler, ErrorResponse, ...
├── frontend/               # React + TS + Vite (:5173)
│   └── src/
│       ├── api/            # Axios instance + interceptors, auth/order API fns
│       ├── context/        # AuthContext (JWT lifecycle)
│       ├── components/     # Navbar, ProtectedRoute
│       ├── pages/          # Login, Register, Dashboard, Orders, CreateOrder
│       ├── data/           # Demo product catalog
│       └── utils/          # API error message extraction
├── docker-compose.yml
└── README.md
```

## Configuration

| Variable | Default | Description |
|---|---|---|
| `EUREKA_URI` | `http://localhost:8761/eureka/` | Eureka server URL (set to `http://eureka-server:8761/eureka/` in Compose) |
| `JWT_SECRET` | dev-only value | HMAC signing secret, **min 32 characters** |
| `USER_SERVICE_URL` | `http://user-service` | Base URL order-service uses to reach user-service |

## Screenshots

> Add screenshots here after running the app:
>
> - `docs/screenshots/login.png` — Login page
> - `docs/screenshots/dashboard.png` — Dashboard with stats + catalog
> - `docs/screenshots/orders.png` — Order list with status badges
> - `docs/screenshots/create-order.png` — Order creation form
> - `docs/screenshots/eureka.png` — Eureka dashboard with registered services

## Future Improvements

- Dedicated `product-service` + `inventory-service` instead of the static frontend catalog
- Refresh tokens + token revocation (Redis)
- Centralized config (Spring Cloud Config) and distributed tracing (Micrometer + Zipkin)
- React Query for server-state caching, form library for the order builder
- Contract tests between order-service and user-service (Spring Cloud Contract)
