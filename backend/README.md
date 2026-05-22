# IU Expense Tracker Backend

The backend API for the IU Expense Tracker application, built with Express.js, TypeScript, and PostgreSQL.

## Features

- **Authentication**: JWT-based authentication with refresh tokens
- **Expense Management**: CRUD operations for expenses with categories and tags
- **Category Management**: Custom and default categories with icons and colors
- **Analytics**: Spending trends, category breakdowns, and monthly/yearly reports
- **Validation**: Comprehensive input validation using Zod
- **Security**: Rate limiting, CORS, helmet, and SQL injection prevention

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15
- **ORM**: Prisma
- **Authentication**: JWT + bcrypt
- **Validation**: Zod
- **Testing**: Jest + Supertest

## Getting Started

### Prerequisites

- Node.js 18 or higher
- PostgreSQL 15 or higher
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd iu-expense-app/backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. Set up the database:
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database (development)
   npm run db:push
   
   # Or run migrations (production)
   npm run db:migrate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The API will be available at `http://localhost:3001`.

## API Documentation

### Base URL
```
http://localhost:3001/api/v1
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Create a new user account |
| POST | `/auth/login` | Login with email and password |
| POST | `/auth/refresh-token` | Refresh access token |
| GET | `/auth/me` | Get current user profile |
| PUT | `/auth/me` | Update user profile |
| PUT | `/auth/change-password` | Change user password |
| POST | `/auth/logout` | Logout user |
| DELETE | `/auth/deactivate` | Deactivate user account |

### Expense Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/expenses` | Get all expenses with filtering |
| POST | `/expenses` | Create a new expense |
| GET | `/expenses/:id` | Get a specific expense |
| PUT | `/expenses/:id` | Update an expense |
| DELETE | `/expenses/:id` | Delete an expense |
| GET | `/expenses/summary` | Get expense summary |
| GET | `/expenses/stats` | Get expense statistics |

### Category Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | Get all categories |
| POST | `/categories` | Create a new category |
| GET | `/categories/:id` | Get a specific category |
| PUT | `/categories/:id` | Update a category |
| DELETE | `/categories/:id` | Delete a category |
| POST | `/categories/default` | Create default categories |
| GET | `/categories/stats` | Get category statistics |

### Analytics Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/analytics/dashboard` | Get dashboard statistics |
| GET | `/analytics/spending-trends` | Get spending trends |
| GET | `/analytics/category-breakdown` | Get category breakdown |
| GET | `/analytics/monthly-report` | Get monthly report |
| GET | `/analytics/yearly-report` | Get yearly report |

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/expense_tracker?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key"
JWT_REFRESH_SECRET="your-super-secret-refresh-key"

# Server
PORT=3001
NODE_ENV="development"
FRONTEND_URL="http://localhost:3000"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# File Storage (optional)
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
AWS_REGION=""
AWS_S3_BUCKET=""
```

## Database Schema

The application uses the following main tables:

- **users**: User accounts and authentication
- **categories**: Expense categories with customization
- **expenses**: Individual expense records
- **budgets**: Budget tracking (future feature)
- **recurring_expenses**: Recurring expense templates (future feature)

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start development server with hot reload |
| `build` | Build TypeScript to JavaScript |
| `start` | Start production server |
| `test` | Run test suite |
| `lint` | Run ESLint |
| `lint:fix` | Fix ESLint issues |
| `db:generate` | Generate Prisma client |
| `db:push` | Push schema to database |
| `db:migrate` | Run database migrations |
| `db:studio` | Open Prisma Studio |

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.
