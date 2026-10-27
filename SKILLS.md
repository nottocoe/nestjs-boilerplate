# Project Architecture & Coding Standards (SKILLS.md)

This document describes the architecture, coding standards, and design patterns of NWL NestJS services built from **nwl-boilerplate**. It mirrors the conventions of `nwl-system-control-services`.

---

## 1. Directory Structure & Layers

The project follows a **Hexagonal / Clean Architecture** pattern:

```
src/
├── application/           # Application Layer
│   ├── controllers/      # NestJS Controllers (HTTP endpoints)
│   ├── dtos/
│   │   ├── request/      # Incoming request validation schemas
│   │   ├── response/     # Outgoing response schemas
│   │   └── shared/       # cores/{enums,types} and shared schemas (pagination, success)
│   └── mapper/           # Pure functions: database row -> response data
│
├── domain/                # Domain Layer (business logic)
│   ├── services/         # <name>/<name>.service.port.ts + <name>.service.ts
│   ├── repositories/     # <name>/<name>.repository.port.ts + <name>.repository.ts (Prisma)
│   ├── adapters/         # Ports + HTTP clients for other NWL services
│   └── events/           # @OnEvent listeners
│
├── infrastructure/        # Framework glue
│   ├── authentication/   # Passport JWT strategy + guard (stores the bearer token in CLS)
│   ├── roles/            # @Roles() decorator + RolesGuard
│   ├── decorators/       # @ApiGroup() swagger + domain metadata
│   ├── filters/          # AllExceptionsFilter (ECS-logged error body)
│   ├── interceptor/      # LoggerInterceptor (ECS request log)
│   ├── middleware/       # x-correlation-id
│   ├── prisma/           # schema.prisma, migrations, PrismaService, generated client
│   └── shared/           # enums (DI tokens, business), exceptions, helpers
│
└── config/
    ├── config.ts         # Environment-backed config classes
    ├── providers.ts      # Factory providers binding tokens -> implementations
    └── modules/          # core/ (health, prisma) and services/ (one module per domain)
```

---

## 2. Coding Principles & Guidelines

### A. Dependency Injection & Decoupling
- Domain services depend on **ports** (interfaces), never on concrete repositories or adapters.
- Domain classes are plain classes with no `@Inject()`. `src/config/providers.ts` builds them with `useFactory` and lists their dependencies in `inject`.
- Injection tokens live in `src/infrastructure/shared/enums/core.enum.ts` (`SERVICES.*`, `REPOSITORY.*`, `ADAPTERS.*`, `EVENTS.*`).

### B. Request/Response Data Flow
1. **Controllers** validate input with `class-validator` DTOs and call the service port. No business logic.
2. **Domain services** run the use case, call repositories and adapters through ports, and emit events.
3. **Mappers** turn database rows (snake_case) into response data (camelCase).
4. Services wrap results in response DTOs with `plainToInstance` (`status`, `message`, `data`), or in `PaginationResponse` for lists.

### C. Errors
- Throw subclasses of `BaseException` from `infrastructure/shared/exceptions/http-error.ts` with a `DOMAIN.*` name.
- Each service converts unknown errors in one place (see `ExampleService.toDomainError`): a `BaseException` passes through, known Prisma codes map to 409/404, and everything else becomes `InternalError`.
- `AllExceptionsFilter` renders every error as `{ domain, status, code, message, timestamp, path }` and logs it in ECS format.

### D. Database Layer & Prisma
- Only repositories touch Prisma. Services never import `PrismaService`.
- Schema: `src/infrastructure/prisma/schema.prisma`. The client is generated into `src/infrastructure/prisma/generated` on `npm install` (postinstall) or with `npm run prisma:generate`.
- Whitelist sortable columns with a `Record<SORT_BY_ENUM, column>` table and validate `sortBy` with `@IsEnum` in the request DTO.

### E. Separation of Type Definitions
- Types shared between controllers, services, repositories, and adapters go in `src/application/dtos/shared/cores/types/`.
- API request and response schemas go in `src/application/dtos/request/` and `src/application/dtos/response/`.

---

## 3. Adding a New Domain Module

Use the `example` module as the template. For a module named `foo`:

1. **Prisma.** Add `model Foo { ... @@map("foo") }` to `schema.prisma`, then run `npm run prisma:migrate:dev -- --name add_foo`.
2. **Tokens.** Add `SERVICES.FOO_SERVICE`, `REPOSITORY.FOO_REPOSITORY`, and `DOMAIN.FOO` to `core.enum.ts`.
3. **DTOs.** Create `dtos/request/foo.request.ts` and `dtos/response/foo.response.ts`.
4. **Mapper.** Create `mapper/foo.mapper.ts`.
5. **Repository.** Create `domain/repositories/foo/foo.repository.port.ts` and `foo.repository.ts`, then export both from `domain/repositories/index.ts`.
6. **Service.** Create `domain/services/foo/foo.service.port.ts` and `foo.service.ts`, then export both from `domain/services/index.ts`.
7. **Providers.** Add `FooRepositoryProvider` and `FooServiceProvider` to `config/providers.ts`.
8. **Controller.** Create `controllers/foo.controller.ts` with `@ApiGroup(DOMAIN.FOO, 'Foo')` and inject `SERVICES.FOO_SERVICE`.
9. **Module.** Create `config/modules/services/foo.module.ts`, export it from `services/index.ts`, and import it in `app.module.ts`.
10. **Tests.** Add `test/repositories/foo.repository.spec.ts` and `test/services/foo.service.spec.ts`. Import classes from the barrels (`@domain/services`, `@domain/repositories`) so the barrel files count as covered. `src/domain` must stay at 100% coverage.
