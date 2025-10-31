# Subscription Express Clean

Sistema de gestión de suscripciones implementado con **Clean Architecture** sobre Node.js + TypeScript. El objetivo es encapsular la lógica de dominio (planes, usuarios, pagos, suscripciones) y exponerla mediante casos de uso desacoplados y adaptadores reemplazables (HTTP, persistencia, gateways externos).

---

## 🧱 Arquitectura

El proyecto sigue cuatro capas concéntricas:

| Capa | Descripción | Ubicación |
|------|-------------|-----------|
| **Domain** | Entidades, Value Objects, eventos, reglas de negocio puras. No conoce frameworks. | `src/domain` |
| **Application** | Casos de uso y puertos (interfaces) que orquestan el dominio. | `src/application` |
| **Infrastructure** | Adaptadores concretos (HTTP, persistencia in-memory, gateways). | `src/infrastructure` |
| **Main** | Composition root: inyecta adaptadores en los casos de uso y levanta procesos (HTTP server). | `main` |

Dependencias solo apuntan hacia dentro (Infra → Application → Domain). Ninguna importación circular.

### Dominio

- **Entidades**: `User`, `Plan`, `Subscription`, `Payment` con métodos ricos (activar/desactivar, renovar, etc.).
- **Value Objects**: `UserId`, `EmailAddress`, `Price`, `BillingCycle`, `SubscriptionStatusValue`, etc. Garantizan invariantes y evitan primitive obsession.
- **Eventos de dominio**: `SubscriptionCreatedEvent`, `SubscriptionRenewedEvent`, `SubscriptionCancelledEvent`, `SubscriptionResumedEvent`.

### Casos de uso

#### Suscripciones
- `CreateSubscriptionUseCase`: crea suscripción `pending`, cobra, activa y publica evento.
- `RenewSubscriptionUseCase`: cobra, renueva fechas y emite evento.
- `CancelSubscriptionUseCase`: cancela con fecha efectiva.
- `PauseSubscriptionUseCase`: cambia a estado `paused`.
- `ResumeSubscriptionUseCase`: vuelve a `active` desde `paused`/`pending` y publica evento.

#### Usuarios
- `CreateUserUseCase`: valida email único, crea user.
- `UpdateUserProfileUseCase`: actualiza email/nombre con comprobación de duplicados.
- `ToggleUserStatusUseCase`: activa/desactiva el usuario.

#### Planes
- `CreatePlanUseCase`.
- `UpdatePlanDetailsUseCase` (nombre/descripción).
- `UpdatePlanPriceUseCase`.
- `TogglePlanStatusUseCase`.

Casos de pago extra (registro manual) pueden añadirse reutilizando `Payment` y `PaymentGateway` si se requiere.

### Infraestructura actual

Implementaciones in-memory útiles para desarrollo y pruebas:

- Persistencia: `InMemoryPlanRepository`, `InMemoryUserRepository`, `InMemorySubscriptionRepository` (`src/infrastructure/adapters/persistence/in-memory`).
- Gateway de pagos simulado: `InMemoryPaymentGateway`.
- Publicador de eventos: `InMemoryEventPublisher` (almacena eventos en memoria para inspección).
- Generador de IDs: `UuidIdGenerator` (usa `crypto.randomUUID`).
- HTTP: Express con controladores (`SubscriptionsController`, `UsersController`, `PlansController`) y router `buildRouter` (`src/infrastructure/adapters/http`).

Todos los adaptadores usan los puertos de aplicación y devuelven entidades rehidratadas desde snapshots (`toPrimitives` / `fromPrimitives`).

---

## 🚀 Entrada (Composition Root)

- `main/composition.ts`: crea instancias de repositorios/gateways, genera un objeto `useCases` y expone `infrastructure` (útil en tests o CLI).
- `main/server.ts`: importa `useCases`, construye router y servidor Express (`createServer`) y lo arranca en `PORT` (default 3000).

```bash
npm run dev      # lanza HTTP server
npm run dev:composition  # ejecuta composition root (debug/manual)
```

---

## 📦 Dependencias

- `express` + `@types/express` (adaptador HTTP).
- `dotenv` (listo para configurar variables de entorno si se necesita).
- `ts-node`, `typescript`.
- `vitest` para pruebas unitarias.

Instala todo con:

```bash
npm install
```

---

## 🧪 Testing

Comando principal:

```bash
npm test
```

Cobertura cubre:

- Entidades: `tests/unit/domain/entities/*`
- Casos de uso: `tests/unit/application/use-cases/**/*`
- Para tests de infraestructura o integración se pueden crear suites adicionales reutilizando el composition root o los adaptadores in-memory.

---

## 🌐 API HTTP

Base URL: `http://localhost:3000/api`

### Suscripciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/subscriptions` | Crea suscripción (requiere `userId`, `planId`). |
| `POST` | `/subscriptions/:id/renew` | Renueva (opcional `effectiveDate`). |
| `POST` | `/subscriptions/:id/cancel` | Cancela (opcional `effectiveDate`). |
| `POST` | `/subscriptions/:id/pause` | Pausa suscripción. |
| `POST` | `/subscriptions/:id/resume` | Resume suscripción. |

### Usuarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/users` | Crea usuario (email, name). |
| `PATCH` | `/users/:id` | Actualiza email/nombre. |
| `POST` | `/users/:id/status` | Activa/desactiva (`{ "isActive": true|false }`). |

### Planes

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/plans` | Crea plan (name, amount, currency, billingCycle). |
| `PATCH` | `/plans/:id` | Actualiza nombre/descr. |
| `POST` | `/plans/:id/price` | Cambia precio (amount, currency). |
| `POST` | `/plans/:id/status` | Activa/desactiva. |

### Ejemplos cURL

```bash
# Crear plan
PLAN_ID=$(curl -s -X POST http://localhost:3000/api/plans \
  -H "Content-Type: application/json" \
  -d '{"name":"Starter","amount":15,"currency":"USD","billingCycleUnit":"month"}' | jq -r '.planId')

# Crear usuario
USER_ID=$(curl -s -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"Ada"}' | jq -r '.userId')

# Crear suscripción
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"planId\":\"$PLAN_ID\"}"
```

> Nota: las implementaciones son en memoria, por lo que los datos se reinician al reiniciar el servidor.

---

## 🧭 Roadmap sugerido

- **Persistencia real**: crear adaptadores Postgres/Mongo implementando los mismos puertos.
- **Validación y errores tipados**: usar librerías (p.ej. Zod) para validar DTOs en controladores y modelar errores específicos.
- **Autenticación / autorización**: agregar middleware y casos de uso asociados.
- **Observabilidad**: logging estructurado, métricas, tracing.
- **Testing e2e**: montar pruebas sobre el servidor Express aprovechando los adaptadores in-memory o dobles de test.

---

## 🤝 Contribuir

1. Crea branch a partir de `main`/`infrastructure` según corresponda.
2. Sigue las reglas de Clean Architecture (no mezclar dependencias innecesarias).
3. Agrega/actualiza pruebas con `vitest`.
4. Ejecuta `npm test` antes de abrir PR.
5. Documenta cualquier nuevo adaptador o caso de uso en este README.

¡Listo! Ya puedes explorar, extender o integrar este sistema de suscripciones. ✨
