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

### Persistencia y adaptadores

Actualmente existen dos familias de adaptadores que implementan los mismos puertos:

| Puerto | In-memory | PostgreSQL (TypeORM) | Ubicación |
|--------|-----------|----------------------|-----------|
| `PlanRepository` | `InMemoryPlanRepository` | `TypeOrmPlanRepository` | `src/infrastructure/adapters/persistence/*` |
| `UserRepository` | `InMemoryUserRepository` | `TypeOrmUserRepository` | idem |
| `SubscriptionRepository` | `InMemorySubscriptionRepository` | `TypeOrmSubscriptionRepository` | idem |
| `PaymentGateway` | `InMemoryPaymentGateway` | *(stub actual)* | `src/infrastructure/adapters/gateways` |
| `EventPublisher` | `InMemoryEventPublisher` | *(stub actual)* | `src/infrastructure/adapters/gateways` |

Los repositorios TypeORM apuntan al esquema PostgreSQL definido en `src/infrastructure/database` (entidades + migraciones). Puedes seleccionar qué implementación usar poniendo `PERSISTENCE=memory` (default) o `PERSISTENCE=typeorm`.

HTTP sigue siendo Express (`src/infrastructure/adapters/http`). Cada controlador mapea JSON ↔ DTOs before delegar a los casos de uso.

---

## ⚙️ Configuración local

1. **Instalar dependencias**
   ```bash
   npm install
   ```
2. **Variables de entorno**
   ```bash
   cp .env.example .env
   ```
   Ajusta `DATABASE_*`, `DATABASE_URL`, `PORT` y `PERSISTENCE` según tu entorno.
3. **Levantar PostgreSQL con Docker**
   ```bash
   docker compose up -d postgres
   ```
   El servicio usa la imagen oficial `postgres:16-alpine`, expone el puerto `5432` y persiste datos en `postgres_data`.
4. **Migraciones TypeORM**
   ```bash
   npm run migration:run
   ```
5. **Arrancar el servidor**
   ```bash
   PERSISTENCE=typeorm npm run dev   # usa Postgres real
   # o
   npm run dev                       # modo in-memory
   ```

> El composition root (`main/composition.ts`) inicializa los repositorios adecuados según `PERSISTENCE`. `main/server.ts` lo invoca antes de montar Express.

### Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Levanta el HTTP server (usa `PERSISTENCE` del entorno). |
| `npm run dev:composition` | Ejecuta el composition root manualmente. |
| `npm run migration:run` | Aplica las migraciones configuradas. |
| `npm run migration:revert` | Revierte la última migración. |
| `npm run migration:generate -- --name <Nombre>` | Genera una nueva migración basada en las entidades. |

---

## 📦 Dependencias principales

- **Servidor / utilidades**: `express`, `dotenv`, `reflect-metadata`.
- **Persistencia**: `typeorm`, `pg`.
- **Tooling**: `ts-node`, `typescript`, `vitest`.

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

Base URL: `{{API_URL}}`

### Suscripciones

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/subscriptions` | Lista todas las suscripciones. |
| `GET` | `/subscriptions/:id` | Obtiene una suscripción por ID. |
| `POST` | `/subscriptions` | Crea suscripción (requiere `userId`, `planId`). |
| `PATCH` | `/subscriptions/:id/renew` | Renueva (opcional `effectiveDate`). |
| `DELETE` | `/subscriptions/:id` | Cancela (opcional `effectiveDate`). |
| `PATCH` | `/subscriptions/:id/pause` | Pausa suscripción. |
| `PATCH` | `/subscriptions/:id/resume` | Resume suscripción. |

### Usuarios

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/users` | Lista todos los usuarios. |
| `GET` | `/users/:id` | Obtiene un usuario por ID. |
| `POST` | `/users` | Crea usuario (email, name). |
| `PATCH` | `/users/:id` | Actualiza email/nombre. |
| `POST` | `/users/:id/status` | Activa/desactiva (`{ "isActive": true|false }`). |

### Planes

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/plans` | Lista todos los planes. |
| `GET` | `/plans/:id` | Obtiene un plan por ID. |
| `POST` | `/plans` | Crea plan (name, amount, currency, billingCycle). |
| `PATCH` | `/plans/:id` | Actualiza nombre/descr. |
| `PATCH` | `/plans/:id/price` | Cambia precio (amount, currency). |
| `PATCH` | `/plans/:id/status` | Activa/desactiva. |

### Ejemplos cURL

```bash
# Crear plan
PLAN_ID=$(curl -s -X POST {{API_URL}}/plans \
  -H "Content-Type: application/json" \
  -d '{"name":"Starter","amount":15,"currency":"USD","billingCycleUnit":"month"}' | jq -r '.planId')

# Crear usuario
USER_ID=$(curl -s -X POST {{API_URL}}/users \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"Ada"}' | jq -r '.userId')

# Crear suscripción
curl -X POST {{API_URL}}/subscriptions \
  -H "Content-Type: application/json" \
  -d "{\"userId\":\"$USER_ID\",\"planId\":\"$PLAN_ID\"}"

# Renovar
curl -X PATCH {{API_URL}}/subscriptions/SUB_ID/renew \
  -H "Content-Type: application/json" \
  -d '{ "effectiveDate": "2025-01-01T00:00:00Z" }'

# Pausar
curl -X PATCH {{API_URL}}/subscriptions/SUB_ID/pause

# Reanudar
curl -X PATCH {{API_URL}}/subscriptions/SUB_ID/resume

# Cancelar
curl -X DELETE {{API_URL}}/subscriptions/SUB_ID \
  -H "Content-Type: application/json" \
  -d '{ "effectiveDate": "2025-02-01T00:00:00Z" }'
```

> Nota: si usas `PERSISTENCE=memory`, los datos se pierden al reiniciar. Con `PERSISTENCE=typeorm` quedan guardados en PostgreSQL.

---

## 🧭 Roadmap sugerido

- **Persistencia real**: crear adaptadores Postgres/Mongo implementando los mismos puertos.
- **Validación y errores tipados**: usar librerías (p.ej. Zod) para validar DTOs en controladores y modelar errores específicos.
- **Autenticación / autorización**: agregar middleware y casos de uso asociados.
- **Observabilidad**: logging estructurado, métricas, tracing.
- **Testing e2e**: montar pruebas sobre el servidor Express aprovechando los adaptadores in-memory o dobles de test.

---

## 🤝 Contribuir

1. Crea una branch desde `main`.
2. Respeta la dirección de dependencias (Infra → App → Domain) y mantén los adapters aislados.
3. Agrega/actualiza pruebas con `vitest`.
4. Ejecuta `npm test` y, si tocaste DB, `npm run migration:run` para validar.
5. Documenta nuevos adaptadores o decisiones (README principal o de cada carpeta).

¡Listo! Ya puedes explorar, extender o integrar este sistema de suscripciones. ✨
