# Database Layer

Esta carpeta concentra todo lo referente a la persistencia con PostgreSQL + TypeORM.

## Componentes

| Archivo/Directorio | Descripción |
|--------------------|-------------|
| `data-source.ts` | Configura `AppDataSource`, lee variables (`DATABASE_URL` o `DATABASE_*`) y registra entidades + migraciones. |
| `entities/` | Mapeos TypeORM de tablas (`UserEntity`, `PlanEntity`, `PlanPriceEntity`, `SubscriptionEntity`, etc.). |
| `migrations/` | Migraciones generadas con el CLI (`1729020000000-InitSchema.ts` crea el esquema completo). |

## Variables de entorno relevantes

```
DATABASE_URL=postgres://user:pass@host:port/db   # opcional
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=subscription_express
TYPEORM_LOGGING=false
```

Si defines `DATABASE_URL`, tiene prioridad sobre el resto.

## Comandos útiles

```bash
# Aplicar migraciones
npm run migration:run

# Revertir la última
npm run migration:revert

# Generar una nueva en base a las entidades
npm run migration:generate -- --name AddSomething
```

> Recuerda levantar PostgreSQL (por ejemplo con `docker compose up -d postgres`) antes de ejecutar los comandos.

## Convenciones

- Los enums (ej. `subscription_status`, `payment_status`) se definen explícitamente con `enumName` para reutilizarlos en migraciones.
- Los IDs usan UUID (lo generan los casos de uso mediante `UuidIdGenerator`).
- `updated_by` referencia opcionalmente a `users.id`; para procesos automáticos puedes dejar `NULL` o usar un usuario de sistema.
