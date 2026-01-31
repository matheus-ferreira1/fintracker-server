---
name: bun-node-express
description: Bun/Node.js/Express best practices for building scalable, type-safe backend applications.
---

# Bun/Node.js/Express Standards

## Core Principles

- Use TypeScript with strict mode for all projects
- Prefer Bun runtime for performance; fallback to Node.js when needed
- Consider Hono or Fastify over Express for new projects (better TypeScript, performance)
- Keep handlers thin: validation and delegation only
- Follow single responsibility: one module, one purpose
- Use dependency injection for testability

## Project Structure

- Package by feature, not by layer:
  ```
  src/
    users/
      user.router.ts
      user.service.ts
      user.repository.ts
      user.schema.ts
      user.test.ts
    orders/
      order.router.ts
      ...
  ```
- Keep shared utilities in `src/lib/` or `src/common/`
- Use `src/config/` for environment configuration
- Entry point at `src/index.ts` or `src/server.ts`

## Router Design

- Use router composition: mount feature routers on main app
- Group related endpoints in feature-specific routers
- Use proper HTTP methods: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove)
- Return appropriate status codes: 200, 201, 204, 400, 401, 403, 404, 409, 500
- Use plural nouns for resources: `/users`, `/orders`
- Version APIs when needed: `/api/v1/users`

## Middleware Patterns

- Order matters: auth → validation → rate limiting → handler
- Create reusable middleware for cross-cutting concerns
- Use higher-order functions for middleware factories:
  ```typescript
  const requireRole = (role: Role) => (req, res, next) => { ... }
  ```
- Keep middleware focused on a single responsibility
- Pass data through `req.locals` or context objects, not mutation

## Request Validation

- Validate all input at the boundary using Zod or Valibot
- Create schemas for request body, params, and query
- Use inference for type-safe handlers:
  ```typescript
  const createUserSchema = z.object({ email: z.string().email() })
  type CreateUserInput = z.infer<typeof createUserSchema>
  ```
- Return 400 with descriptive validation errors
- Sanitize input to prevent injection attacks

## Error Handling

- Use a global error handler middleware (must have 4 parameters in Express)
- Create typed custom error classes with status codes:
  ```typescript
  class NotFoundError extends AppError {
    constructor(resource: string) {
      super(`${resource} not found`, 404)
    }
  }
  ```
- Throw errors in services; catch and format in error middleware
- Never expose stack traces in production
- Log errors with context (request ID, user ID, endpoint)
- Return consistent error responses: `{ error: { code, message, details? } }`

## Service Layer

- Business logic belongs in services, not routes or repositories
- Services should be stateless and injectable
- Use pure functions when possible
- Handle transactions at the service level
- Return domain objects, not database entities

## Data Access

- Use type-safe query builders: Drizzle ORM, Prisma, or Kysely
- Never write raw SQL strings (injection risk, no type safety)
- Create repository abstractions for complex queries
- Use transactions for multi-step operations
- Handle `null` explicitly with proper types
- Use pagination for list endpoints (`limit`, `offset` or cursor-based)

## Database & Migrations

- Use migration tools (Drizzle Kit, Prisma Migrate)
- Never auto-sync schemas in production
- Keep migrations reversible when possible
- Seed data separately from migrations
- Use connection pooling (Bun's SQLite, PgBouncer for Postgres)

## Authentication & Authorization

- Use JWTs for stateless auth or sessions for stateful
- Store secrets in environment variables
- Hash passwords with Argon2 or bcrypt
- Implement refresh token rotation
- Use middleware for route protection
- Validate permissions at the service layer

## Configuration

- Use environment variables for all config
- Validate config at startup with Zod:
  ```typescript
  const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    PORT: z.coerce.number().default(3000),
  })
  export const env = envSchema.parse(process.env)
  ```
- Fail fast on missing required config
- Use `.env.example` for documentation
- Never commit secrets to version control

## Testing

- Test behavior, not implementation
- Use Bun's built-in test runner or Vitest
- Structure: Arrange → Act → Assert
- Name tests descriptively: `returnsUser_whenUserExists`
- Use in-memory databases for repository tests
- Mock external services at the boundary
- Test error cases and edge conditions
- Use supertest or Hono's testing utilities for integration tests

## Logging & Observability

- Use structured logging (Pino, Winston)
- Log levels: ERROR (failures), WARN (issues), INFO (flow), DEBUG (details)
- Include correlation IDs for request tracing
- Log request/response for debugging (mask sensitive data)
- Integrate with observability platforms (OpenTelemetry)
- Use health check endpoints (`/health`, `/ready`)

## Performance

- Use streaming for large responses
- Implement caching strategies (Redis, in-memory)
- Use connection pooling for databases
- Consider rate limiting for public APIs
- Profile with Bun's built-in profiler or clinic.js
- Use async/await properly; avoid blocking the event loop
- Prefer `Promise.all` for parallel independent operations

## Security

- Validate and sanitize all user input
- Use parameterized queries (ORMs do this)
- Implement rate limiting
- Set security headers (Helmet.js or manual)
- Use HTTPS in production
- Configure CORS properly
- Protect against CSRF for session-based auth
- Follow OWASP Top 10 guidelines

## Bun-Specific Features

- Use `Bun.serve()` for native HTTP server (faster than Express)
- Leverage `Bun.file()` for efficient file operations
- Use `Bun.password` for password hashing
- Use `bun:sqlite` for embedded SQLite
- Use `Bun.env` for environment access
- Consider Hono framework for Bun-optimized routing

## Avoid

- Callback-based patterns (use async/await)
- Mutable shared state
- Business logic in route handlers
- Raw SQL strings
- Exposing database entities in API responses
- Catching generic errors without re-throwing
- Synchronous file operations in request handlers
- `any` type or disabled TypeScript checks
- Magic strings for configuration
- Nested callbacks (callback hell)
- `req.body` without validation
- Hardcoded secrets or URLs
- Ignoring promise rejections
- Over-engineering simple APIs
