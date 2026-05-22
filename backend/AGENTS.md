# Backend Development Guidelines (Node.js + Express)

## Project Overview
This is a production-level Node.js/Express backend API for the IU Expense Tracker application using TypeScript, Prisma ORM, and PostgreSQL.

## Tech Stack
- **Runtime**: Node.js (>=18.0.0)
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Zod / Joi
- **Logging**: Winston
- **Testing**: Jest + Supertest

## Code Style & Conventions

### File Structure
```
src/
├── controllers/     # Request handlers
├── middleware/      # Express middleware
├── routes/          # Route definitions
├── services/        # Business logic
├── utils/           # Helper functions
├── types/           # TypeScript types/interfaces
├── validators/      # Request validation schemas
└── server.ts        # Application entry point
```

### Naming Conventions
- **Files**: Use kebab-case (e.g., `expense-controller.ts`)
- **Classes**: Use PascalCase (e.g., `ExpenseService`)
- **Functions/Variables**: Use camelCase (e.g., `getExpenseById`)
- **Constants**: Use SCREAMING_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Interfaces/Types**: Use PascalCase with descriptive names (e.g., `CreateExpenseDto`)

### API Design
- Follow RESTful conventions
- Use proper HTTP methods (GET, POST, PUT, PATCH, DELETE)
- Return consistent response structures:
  ```typescript
  // Success
  { data: T, message?: string, meta?: { timestamp, pagination? } }
  
  // Error
  { error: { code: string, message: string } }
  ```
- Use proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Version APIs (e.g., `/api/v1/`)

### Error Handling
- Use centralized error handling middleware
- Create custom error classes for different error types
- Never expose internal error details in production
- Log all errors with appropriate context

### Security
- Use Helmet for security headers
- Implement rate limiting with express-rate-limit
- Validate and sanitize all inputs
- Use parameterized queries (Prisma handles this)
- Store secrets in environment variables
- Hash passwords with bcrypt (min 10 rounds)
- Use short-lived JWTs with refresh token rotation

### Database
- Use Prisma migrations for schema changes
- Never use raw SQL unless absolutely necessary
- Index frequently queried columns
- Use transactions for multi-step operations
- Soft delete when appropriate

### Validation
- Validate all request bodies, params, and queries
- Use Zod or Joi schemas
- Return descriptive validation error messages

### Logging
- Use Winston for structured logging
- Log levels: error, warn, info, debug
- Include request IDs for traceability
- Never log sensitive data (passwords, tokens)

### Testing
- Write unit tests for services
- Write integration tests for API endpoints
- Aim for >80% code coverage
- Use test fixtures and factories
- Mock external dependencies

### Environment Variables
- Use `.env` for local development
- Never commit `.env` files
- Document all required env vars in `env.example`
- Validate env vars at startup

## Commands
- `pnpm dev` - Start development server with hot reload
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm db:migrate` - Run database migrations
- `pnpm db:studio` - Open Prisma Studio

## Best Practices
1. Keep controllers thin - move logic to services
2. Use dependency injection where possible
3. Write self-documenting code with clear function names
4. Handle edge cases and null checks
5. Use async/await consistently (no mixing with .then())
6. Close database connections properly
7. Implement graceful shutdown
8. Use TypeScript strict mode
