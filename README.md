# Subscription Express Clean

Subscription management system implemented with **Clean Architecture** on top of Node.js + TypeScript. The goal is to encapsulate domain logic (plans, users, payments, subscriptions) and expose it through decoupled use cases with replaceable adapters (HTTP, persistence, external gateways).

---

## 🧱 Architecture

The project follows four concentric layers:

| Layer | Description | Location |
|------|-------------|----------|
| **Domain** | Entities, Value Objects, events, pure business rules. Framework-agnostic. | `src/domain` |
| **Application** | Use cases and ports (interfaces) orchestrating the domain. | `src/application` |
| **Infrastructure** | Concrete adapters (HTTP, in-memory persistence, gateways). | `src/infrastructure` |
| **Main** | Composition root: wires adapters into use cases and boots processes (HTTP server). | `main` |

Dependencies always point inward (Infra → Application → Domain). No circular imports.

### Domain

- **Entities**: `User`, `Plan`, `Subscription`, `Payment` with rich behavior (activate/deactivate, renew, etc.).
- **Value Objects**: `UserId`, `EmailAddress`, `Price`, `BillingCycle`, `SubscriptionStatusValue`, etc., to guarantee invariants and avoid primitive obsession.
- **Domain Events**: `SubscriptionCreatedEvent`, `SubscriptionRenewedEvent`, `SubscriptionCancelledEvent`, `SubscriptionResumedEvent`.

### Use Cases

#### Subscriptions
- `CreateSubscriptionUseCase`: creates a pending subscription, charges, activates, and publishes an event.
- `RenewSubscriptionUseCase`: charges, shifts dates, emits event.
- `CancelSubscriptionUseCase`: cancels with an effective date.
- `PauseSubscriptionUseCase`: switches to `paused`.
- `ResumeSubscriptionUseCase`: returns to `active` from `paused`/`pending` and emits event.

#### Users
- `CreateUserUseCase`: ensures unique email, creates user.
- `UpdateUserProfileUseCase`: updates email/name with duplication checks.
- `ToggleUserStatusUseCase`: activates/deactivates user.

#### Plans
- `CreatePlanUseCase`.
- `UpdatePlanDetailsUseCase` (name/description).
- `UpdatePlanPriceUseCase`.
- `TogglePlanStatusUseCase`.
- Additional payment-related use cases can reuse `Payment` and `PaymentGateway` when needed.

### Infrastructure Adapters

#### Persistence options

Two interchangeable families implementing the same ports:

| Port | In-memory | PostgreSQL (TypeORM) | Location |
|------|-----------|----------------------|----------|
| `PlanRepository` | `InMemoryPlanRepository` | `TypeOrmPlanRepository` | `src/infrastructure/adapters/persistence/*` |
| `UserRepository` | `InMemoryUserRepository` | `TypeOrmUserRepository` | idem |
| `SubscriptionRepository` | `InMemorySubscriptionRepository` | `TypeOrmSubscriptionRepository` | idem |
| `PaymentGateway` | `InMemoryPaymentGateway` | *(stub for now)* | `src/infrastructure/adapters/gateways` |
| `EventPublisher` | `InMemoryEventPublisher` | *(stub for now)* | `src/infrastructure/adapters/gateways` |

TypeORM repositories target the PostgreSQL schema in `src/infrastructure/database` (entities + migrations). Choose the implementation via `PERSISTENCE=memory` (default) or `PERSISTENCE=typeorm`.

HTTP still uses Express (`src/infrastructure/adapters/http`). Controllers translate JSON ↔ DTOs before delegating to use cases.

---

## ⚙️ Local Setup

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Environment variables**
   ```bash
   cp .env.example .env
   ```
   Adjust `DATABASE_*`, `DATABASE_URL`, `PORT`, and `PERSISTENCE` as needed.
3. **Run PostgreSQL with Docker**
   ```bash
   docker compose up -d postgres
   ```
   Uses `postgres:16-alpine`, exposes port `5432`, and keeps data in `postgres_data`.
4. **Run migrations**
   ```bash
   npm run migration:run
   ```
5. **Start the server**
   ```bash
   PERSISTENCE=typeorm npm run dev   # real Postgres
   npm run dev                       # in-memory
   ```

> The composition root (`main/composition.ts`) picks the proper repositories based on `PERSISTENCE`. `main/server.ts` invokes it before mounting Express.

### Available scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts the HTTP server (honors `PERSISTENCE`). |
| `npm run dev:composition` | Executes the composition root manually. |
| `npm run migration:run` | Applies migrations. |
| `npm run migration:revert` | Reverts last migration. |
| `npm run migration:generate -- --name Foo` | Generates a migration from current entities. |

---

## 📦 Key Dependencies

- **Server/utilities**: `express`, `dotenv`, `reflect-metadata`.
- **Persistence**: `typeorm`, `pg`.
- **Tooling**: `ts-node`, `typescript`, `vitest`.

---

## 🧪 Testing

```bash
npm test
```

Coverage includes:
- Domain entities: `tests/unit/domain/entities/*`
- Use cases: `tests/unit/application/use-cases/**/*`
- Add integration suites as needed by reusing the composition root or adapters.

---

## 🌐 HTTP API

Base URL: `{{API_URL}}`

### Subscriptions

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/subscriptions` | List all subscriptions. |
| `GET` | `/subscriptions/:id` | Fetch subscription by ID. |
| `POST` | `/subscriptions` | Create subscription (`userId`, `planId`). |
| `PATCH` | `/subscriptions/:id/renew` | Renew (optional `effectiveDate`). |
| `DELETE` | `/subscriptions/:id` | Cancel (optional `effectiveDate`). |
| `PATCH` | `/subscriptions/:id/pause` | Pause subscription. |
| `PATCH` | `/subscriptions/:id/resume` | Resume subscription. |

### Users

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/users` | List all users. |
| `GET` | `/users/:id` | Fetch user by ID. |
| `POST` | `/users` | Create user (email, name). |
| `PATCH` | `/users/:id` | Update email/name. |
| `POST` | `/users/:id/status` | Toggle status (`{ "isActive": true|false }`). |

### Plans

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/plans` | List all plans. |
| `GET` | `/plans/:id` | Fetch plan by ID. |
| `POST` | `/plans` | Create plan (name, amount, billing cycle, etc.). |
| `PATCH` | `/plans/:id` | Update name/description. |
| `PATCH` | `/plans/:id/price` | Update price (amount, currency). |
| `PATCH` | `/plans/:id/status` | Toggle activation. |

### Sample cURLs

```bash
# Create plan
PLAN_ID=$(curl -s -X POST {{API_URL}}/plans \
  -H "Content-Type: application/json" \
  -d '{"name":"Starter","amount":15,"currency":"USD","billingCycleUnit":"month"}' | jq -r '.planId')

# Create user
USER_ID=$(curl -s -X POST {{API_URL}}/users \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"Ada"}' | jq -r '.userId')

# Create subscription
curl -X POST {{API_URL}}/subscriptions \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"planId\":\"$PLAN_ID\"}"

# Renew
curl -X PATCH {{API_URL}}/subscriptions/SUB_ID/renew \
  -H "Content-Type: application/json" \
  -d '{ "effectiveDate": "2025-01-01T00:00:00Z" }'

# Pause
curl -X PATCH {{API_URL}}/subscriptions/SUB_ID/pause

# Resume
curl -X PATCH {{API_URL}}/subscriptions/SUB_ID/resume

# Cancel
curl -X DELETE {{API_URL}}/subscriptions/SUB_ID \
  -H "Content-Type: application/json" \
  -d '{ "effectiveDate": "2025-02-01T00:00:00Z" }'
```

> Note: with `PERSISTENCE=memory` data resets after restart. With `PERSISTENCE=typeorm` it persists in PostgreSQL.

---

## 🧭 Suggested Roadmap

- **Production persistence**: finalize PostgreSQL adapters (or Mongo) behind the same ports.
- **Validation & typed errors**: e.g., Zod for DTO validation, domain-specific error classes.
- **AuthN/AuthZ**: middleware + use cases.
- **Observability**: structured logging, metrics, tracing.
- **E2E testing**: run Express server in tests using adapters suited for integration.

---

## 🤝 Contributing

1. Create a branch off `main`.
2. Respect dependency direction (Infra → App → Domain) and keep adapters isolated.
3. Add/update tests with `vitest`.
4. Run `npm test` and, if you touched DB, `npm run migration:run`.
5. Document new adapters/decisions here or in per-folder READMEs.

Happy hacking! ✨
