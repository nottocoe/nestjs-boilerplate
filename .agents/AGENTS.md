# Development Rules

## Database Operations

- NEVER run database resets without explicit user approval.
- NEVER execute destructive database commands automatically.

Examples include but are not limited to:

- prisma migrate reset
- prisma db push --force-reset
- DROP DATABASE
- DROP SCHEMA
- DROP TABLE
- TRUNCATE TABLE
- DELETE without explicit scope confirmation
- Any script that removes, recreates, or overwrites existing data

Before any destructive database action:

1. Explain the impact.
2. Explain the data-loss risk.
3. Ask for explicit user confirmation.
4. Wait for approval.

Assume all databases contain valuable data unless the user explicitly states otherwise.

---

## Implementation Workflow

For any feature, enhancement, bug fix, refactor, or architectural change:

1. Analyze requirements.
2. Review existing implementation.
3. Identify impacted layers.
4. Implement code changes.
5. Perform self-review.
6. Validate business logic.
7. Verify integration flow.
8. Verify edge cases.
9. Update or create unit tests.
10. Stop and wait for user instruction.

Unit tests must always be the final implementation step.

Do NOT start by generating unit tests before implementation is complete.

Do NOT use TDD unless explicitly requested.

Preferred workflow:

Analyze
→ Implement
→ Self Review
→ Integration Validation
→ Edge Case Review
→ Unit Test
→ Wait for User

---

## Multi-Layer Changes

If a task affects multiple layers:

- Controller
- Service
- Repository
- Prisma
- DTO
- Mapper
- Event Handler
- Queue
- Middleware
- Guard
- Interceptor

Then:

1. Complete all code changes across all affected layers.
2. Verify data flow end-to-end.
3. Verify dependency injection wiring.
4. Verify compile-time consistency.
5. Update unit tests last.

Do not leave partial implementations across layers.

---

## Test Execution Rules

After code changes:

- Create or update unit tests.
- Do NOT automatically run any tests.
- Do NOT automatically run coverage.
- Do NOT automatically run e2e tests.

Forbidden automatic execution includes:

- npm run test
- npm test
- jest
- pnpm test
- yarn test
- npm run coverage
- npm run test:e2e
- nx test
- turbo test
- any equivalent command

Wait for explicit user instruction before executing tests.

Examples:

Allowed:
"Unit tests updated. Tests have NOT been executed."

Not Allowed:
"Implemented and ran tests."

unless the user explicitly requested test execution.

Never claim:

- Tests passed
- Coverage passed
- Build passed

unless they were actually executed.

---

## Build Execution Rules

Do NOT automatically execute:

- npm run build
- nest build
- tsc
- docker build
- helm template
- helm upgrade
- kubectl apply

unless explicitly requested.

You may reason about build success, but do not claim success without execution.

---

## Architecture Rules

Prefer existing project patterns.

Do not introduce:

- new frameworks
- new architectural styles
- new infrastructure components
- new libraries

unless:

- there is a clear benefit
- the tradeoff is explained
- the user approves

Follow the project's established conventions first.

---

## NestJS Rules

Follow existing project structure.

Controllers:

- request validation
- response mapping
- no business logic

Services:

- business logic only

Repositories:

- persistence only

Avoid:

- fat controllers
- fat repositories
- business logic inside controllers
- database access inside controllers

Use dependency injection consistently.

---

## Prisma Rules

Never execute:

- prisma migrate reset
- prisma db push --force-reset
- prisma db execute

without explicit approval.

When schema changes are required:

1. Explain changes.
2. Explain migration impact.
3. Explain potential risks.
4. Generate migration code if requested.
5. Wait for approval before execution.

Prefer migrations over force pushes.

---

## Kubernetes Rules

Never execute destructive Kubernetes operations automatically.

Examples:

- kubectl delete
- kubectl scale to zero
- helm uninstall
- argocd app delete
- namespace deletion

Before infrastructure changes:

1. Explain impact.
2. Explain rollback plan.
3. Explain downtime risk.
4. Wait for approval.

Prefer GitOps workflows whenever available.

---

## CI/CD Rules

Do not modify:

- GitHub Actions
- GitLab CI
- ArgoCD
- Helm Releases
- Deployment Pipelines

unless explicitly requested.

When proposing CI/CD changes:

- explain impact
- explain deployment order
- explain rollback strategy

---

## Security Rules

Never:

- expose secrets
- expose API keys
- expose tokens
- expose certificates
- expose private keys
- hardcode credentials

Always redact sensitive values.

Use placeholders when necessary.

---

## Assumption Rules

Never invent:

- API contracts
- database schemas
- environment variables
- infrastructure topology
- business rules

If information is missing:

- state assumptions clearly
- ask for clarification when necessary

Do not present assumptions as facts.

---

## Code Quality Rules

Prioritize:

1. Correctness
2. Reliability
3. Maintainability
4. Readability
5. Performance

Avoid premature optimization.

Prefer simple and maintainable solutions.

Minimize unnecessary abstractions.

---

## Code Change Rules

Modify only what is necessary.

Avoid:

- unrelated refactors
- unrelated formatting changes
- unrelated file rewrites

Keep diffs as small as possible.

Preserve existing project conventions.

---

## Code Review Rules

When reviewing code:

Prioritize findings by:

1. Correctness
2. Reliability
3. Security
4. Data Integrity
5. Performance
6. Maintainability

Do not focus on style-only issues unless they create real maintenance problems.

---

## Production Incident Rules

For production issues:

1. Gather evidence.
2. Separate facts from assumptions.
3. Identify likely root causes.
4. Propose fixes.
5. Define rollback plans.

Do not recommend risky changes without evidence.

Clearly distinguish:

- Observation
- Hypothesis
- Confirmation

---

## Response Requirements

For implementation tasks provide:

### Analysis

Describe the issue and approach.

### Impacted Files

List affected files.

### Changes

Describe implementation changes.

### Unit Tests

Describe test updates.

### Risks

List risks and considerations.

### Validation Status

State clearly:

- Code updated
- Unit tests updated
- Tests NOT executed
- Coverage NOT executed

unless explicitly requested by the user.