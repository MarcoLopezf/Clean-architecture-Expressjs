# REGLAS DE ARQUITECTURA LIMPIA (CLEAN ARCHITECTURE)

Este documento define las reglas y convenciones arquitectónicas que deben seguirse en el proyecto **Sistema de Suscripciones** para garantizar la separación de preocupaciones y la adherencia a los principios de Clean Architecture.

---

## 1. Regla Fundamental de Dependencia (Dependency Rule)

La regla central de la Arquitectura Limpia es la **Regla de Dependencia**.

- **Principio:** Nada en un círculo interior puede saber absolutamente nada sobre algo en un círculo exterior.  
- **Dirección de la Dependencia:** La dependencia siempre fluye desde afuera hacia adentro.  
- **Implicación Clave:** La capa de *Entities (Dominio)* es independiente, y la capa de *Frameworks & Drivers (Infraestructura, Web, DB)* depende de todas las demás capas.

### 🚫 Violaciones Prohibidas (Anti-patrones):
1. Importar `express`, `fastify` o `prisma` desde las capas `application` o `domain`.  
2. Leer `process.env` fuera de la capa `infrastructure/config`.

---

## 2. Estructura y Barreras de Capas

La estructura de carpetas define las barreras de importación:

| Capa | Rol Principal | Restricción de Dependencia | Ubicación Sugerida |
|------|----------------|-----------------------------|--------------------|
| **Dominio (Entities)** | Contiene Entidades, Value Objects y Reglas de Negocio Centrales. | No puede importar NADA de `application` o `infrastructure`. | `/src/domain` |
| **Aplicación (Use Cases)** | Contiene la lógica específica de la aplicación y define los Puertos (Interfaces). | No puede importar librerías de frameworks (Request/Response, Prisma). | `/src/application` |
| **Infraestructura (Adapters)** | Contiene adaptadores (Controladores HTTP, Repositorios DB, Gateways externos). | Contiene a Express.js, MongoDB, Redis u otras tecnologías reemplazables. | `/src/infrastructure` |
| **Composición (Root)** | Donde se cablean las dependencias (DI). | Debe ser el Composition Root único y visible. | `/src/main` |

---

## 3. Capa de Dominio: Entidades y Value Objects

El Dominio debe ser **rápido, puro y significativo**.

### A. Reglas de las Entidades y Agregados (Suscripción, Usuario, Plan, Pago)

Las entidades (`Subscription`, `User`, `Plan`) son objetos que poseen **Identidad** y gestionan su propia **Consistencia**.

- **Identidad:** La igualdad de una entidad se define por su ID, no por su valor.  
- **Reglas Internas:** La lógica de negocio debe residir en la Entidad/Agregado.  
  Los cambios de estado deben realizarse a través de métodos (`subscription.renew()`), evitando setters mutables que expongan estados inválidos.  
- **Eventos de Dominio:** Los agregados pueden emitir eventos de dominio (ej: `SubscriptionRenewed`, `PaymentFailed`) que describen cambios significativos en su estado.

### B. Reglas de los Value Objects (VOs)

Los Value Objects (ej: `SubscriptionStatus`, `Price`, `BillingCycle`) deben usarse para evitar la *primitive obsession* (usar string/number en lugar de VOs especializados).

- **Inmutabilidad:** Los VOs deben ser inmutables.  
- **Creación Controlada:** Deben usar un método estático `create()` para garantizar y validar invariantes (reglas de negocio) al ser construidos.  
- **Comparación:** Deben implementar una función `equals()` para la comparación por valor.

---

## 4. Capa de Aplicación: Casos de Uso y Puertos

Esta capa define las reglas de negocio específicas y cómo se interactúa con el Dominio.

### A. Casos de Uso (Commands y Queries)

Los Casos de Uso (ej: `CreateSubscription`, `CancelSubscription`) tienen un rol de **orquestación**, no de cálculo fino.

- **Flujo Típico:**  
  `Validar Entrada -> Cargar Agregados -> Invocar Reglas del Agregado -> Publicar Eventos -> Persistir -> Devolver DTO`
- **Intercambio de Datos:**  
  Los Casos de Uso deben recibir **DTOs de entrada (DTO in)** y devolver **DTOs de salida (DTO out)**.

#### 🚫 Anti-patrones Prohibidos:
- No devolver **Entidades** desde la lógica del Caso de Uso.  
- **Tipado de Errores:** Modelar errores como tipos específicos (`validation`, `not_found`, `conflict`, `infrastructure`) en lugar de `throw new Error(...)` genéricos.

### B. Puertos (Interfaces)

Los Puertos expresan las necesidades del Caso de Uso.

- **Nomenclatura:** Nombres del dominio con sufijo (ej: `SubscriptionRepository`, `PaymentGateway`).  
- **Contrato:** Los puertos definen el contrato que los adaptadores de la capa de infraestructura deben implementar.

---

## 5. Capa de Infraestructura: Adaptadores y Express.js

Esta es la capa más externa, que maneja la tecnología y la conexión con el mundo exterior.

### A. Adaptadores de Interfaz (Controladores HTTP / Express)

Aquí es donde se integra **Express.js**.

- **Función:** Los controladores reciben la petición, mapean el input al DTO del Caso de Uso, invocan el Caso de Uso, y mapean los errores tipados a respuestas HTTP (400, 404, 409, 503).  
- **Restricción:** Los controladores no deben contener lógica de negocio.  
- **Nomenclatura:** Deben describir el recurso y la acción (ej: `SubscriptionsController.create`).

### B. Adaptadores de Gateway (Persistencia, Servicios Externos)

Los Adaptadores expresan la tecnología.

- **Implementación:** Son implementaciones concretas de los Puertos (ej: `InMemorySubscriptionRepository`, `PostgresSubscriptionRepository`).  
- **Anti-patrón:** Los adaptadores no deben devolver entidades fuera de la capa de `application`.

---

## 6. Composición e Inversión de Dependencias (DI)

La **Inversión de Dependencias (DI)** garantiza que los Casos de Uso dependan de las **abstracciones (Puertos)** y no de las **implementaciones concretas (Adaptadores)**.

- **Composition Root:**  
  Debe existir un punto de inicio único (`/src/main`) donde se realiza el cableado (wiring).
- **Proceso de Composición:**  
  El *Composition Root* crea los Adaptadores (ej: `InMemoryRepository`) y luego los inyecta en los Casos de Uso de la capa de Aplicación.
- **Entornos:**  
  Este mecanismo permite enrutar diferentes entornos, utilizando implementaciones en memoria para TEST o DEV (`USE_INMEMORY=true`) y bases de datos reales para PROD.

---

---

## 🧱 ESTRUCTURA DE PROYECTO

La siguiente estructura de carpetas **debe respetarse estrictamente** para mantener la separación de capas y cumplir con los principios de **Clean Architecture**.  
Cada carpeta representa una capa con responsabilidades bien definidas y dependencias controladas.

> 🔒 **Regla Clave:** Ninguna capa interna puede depender de una capa externa.  
> Es decir, `/domain` nunca debe importar nada de `/application` o `/infrastructure`.

```plaintext
/src
├── /application
│   ├── /dtos           // DTOs de entrada y salida
│   ├── /ports          // Interfaces (Puertos)
│   └── /use-cases      // Casos de uso (Commands y Queries)
│       └── /subscriptions // Agregado de Suscripción
│
├── /domain             // Entidades y Value Objects del negocio
│   ├── /subscriptions
│   ├── /plans
│   ├── /users
│   ├── /payments
│   └── /shared
│
├── /infrastructure     // Adaptadores (HTTP, DB, Gateways externos)
│   ├── /adapters
│   ├── /config
│   └── /server
│
├── /tests              // Pruebas unitarias y contractuales
│
└── /main               // Composition Root (inyección de dependencias)
    └── composition.ts