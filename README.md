# NestJS Boilerplate

Starter template for NestJS services. It is extracted from `nestjs-system-control-services` and keeps its layering, DI style, auth, logging, error handling, CI, and Docker setup. All domain features are removed. One `example` CRUD module shows how a feature passes through each layer.

Architecture rules and the step-by-step guide for adding a module are in [SKILLS.md](SKILLS.md). Agent rules are in [.agents/AGENTS.md](.agents/AGENTS.md).

---

## What's Included

* **Hexagonal layout.** `application` (controllers, DTOs, mappers), `domain` (services, repositories, adapters, events behind ports), `infrastructure` (framework glue), and `config` (env classes, factory providers, modules).
* **Prisma 7 + PostgreSQL** through the `@prisma/adapter-pg` driver adapter and a `pg` pool.
* **JWT auth** with Passport, a `RolesGuard` driven by `@Roles()`, and `nestjs-cls` to pass the caller's token to other NestJS services.
* **User-service adapter** that checks project membership (`validateMemberInProject`).
* **Domain events** through `@nestjs/event-emitter` (`EXAMPLE_CREATED`).
* **ECS logging** with Winston: a request log interceptor and a global exception filter.
* **Swagger** at `/docs`, a `helmet` CSP, CORS, global `ValidationPipe`, and the `x-correlation-id` middleware.
* **Jest** with a 100% coverage gate on `src/domain`.
* **Delivery.** A multi-stage `Dockerfile` (non-root, Vault-sourced env), GitHub Actions for coverage, Trivy, and GitOps deploy, and an Azure Pipelines entrypoint.

## Example Endpoints

| Method | Path | Guard |
| :--- | :--- | :--- |
| `GET` | `/health` | none |
| `GET` | `/example/:projectId/list` | JWT |
| `GET` | `/example/:projectId/detail/:exampleId` | JWT |
| `POST` | `/example/create` | JWT + `Project Admin` / `Staff` |
| `PATCH` | `/example/:projectId/update/:exampleId` | JWT + `Project Admin` / `Staff` |
| `DELETE` | `/example/:projectId/delete/:exampleId` | JWT + `Project Admin` / `Staff` |

---

## Start a New Service

1. Copy this folder and replace `nestjs-boilerplate` with the service name in these files:
   * `package.json` (`name`)
   * `sonar-project.properties`
   * `.github/workflows/*.y*ml`
   * `src/index.ts` (Swagger title)
   * `src/infrastructure/shared/enums/core.enum.ts` (`DOMAIN.SYSTEM`)
2. Add `apps/<service-name>/values-<ns>.yaml` to `nestjs-k8s-manifest` before you run the deploy workflow.
3. Replace the `example` module with your first module (see [SKILLS.md](SKILLS.md#3-adding-a-new-domain-module)), or delete it.

---

## Environment Variables

A template is in [.env.example](.env.example).

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | HTTP port | `3000` |
| `NODE_ENV` | `development` turns on Prisma query logs | — |
| `LOG_LEVEL` | Winston log level | `info` |
| `DATABASE_HOST` | PostgreSQL host | `localhost` |
| `DATABASE_PORT` | PostgreSQL port | `5432` |
| `DATABASE_NAME` | Database name | — |
| `DATABASE_USER` | Database user | — |
| `DATABASE_PASSWORD` | Database password | — |
| `DATABASE_SSL` | `true` to connect over SSL | `false` |
| `JWT_SECRET` | Secret used to verify JWTs. Required: the app does not start without it. | — |
| `USER_SERVICE_API_URL` | Base URL of `nestjs-user-services` | `https://test.user-api.nestjs-dev.com` |

---

## Quick Start

```bash
cp .env.example .env        # then fill in the values
docker compose up -d        # local PostgreSQL
npm install                 # also generates the Prisma client
npm run prisma:migrate:dev -- --name init
npm run start:dev
```

Open Swagger at `http://localhost:3000/docs`.

### Prisma Scripts

```bash
npm run prisma:generate                          # regenerate the client after schema changes
npm run prisma:migrate:dev -- --name <name>      # create and apply a migration
npm run prisma:migrate:deploy                    # apply migrations (CI / production)
npm run prisma:studio                            # browse data
```

---

## Testing

```bash
npm test
npm run coverage   # fails below 100% on src/domain
npm run lint
```

---

## Docker & Deployment

* The `Dockerfile` builds three stages (`deps`, `builder`, `runner`) on `node:24-alpine`. It runs as `appuser`, and at start it sources `/vault/secrets/config` before `node dist/index.js`.
* `.github/workflows/test-coverage.yml` and `trivy-scan.yml` run on PRs to `main`, `uat`, and `dev`.
* `.github/workflows/build.yaml` runs manually. It builds and pushes the image, bumps the tag in `nestjs-k8s-manifest`, refreshes ArgoCD, and posts to Discord. It needs the `DISCORD_WEBHOOK_URL` secret.
* `azure-pipelines.yml` calls the shared `platform-pipeline-templates` Node.js pipeline.
