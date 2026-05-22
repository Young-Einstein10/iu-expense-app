# Backend API Endpoint Validation Guide

This document provides comprehensive methods to validate all backend endpoints are working as expected.

## Available Endpoints

### System Endpoints
- `GET /health` - Health check
- `GET /api` - API information

### Authentication (`/api/v1/auth`)
- `POST /signup` - User registration
- `POST /login` - User login
- `POST /refresh-token` - Token refresh
- `GET /me` - Get user profile (protected)
- `PUT /me` - Update profile (protected)
- `PUT /change-password` - Change password (protected)
- `POST /logout` - Logout (protected)
- `DELETE /deactivate` - Deactivate account (protected)

### Expenses (`/api/v1/expenses`)
- `GET /summary` - Expense summary
- `GET /stats` - Expense statistics
- `GET /` - Get all expenses (with filtering/pagination)
- `POST /` - Create expense
- `GET /:id` - Get specific expense
- `PUT /:id` - Update expense
- `DELETE /:id` - Delete expense

### Categories (`/api/v1/categories`)
- `GET /stats` - Category statistics
- `POST /default` - Create default categories
- `GET /` - Get all categories
- `POST /` - Create category
- `GET /:id` - Get specific category
- `PUT /:id` - Update category
- `DELETE /:id` - Delete category

### Analytics (`/api/v1/analytics`)
- `GET /dashboard` - Dashboard statistics
- `GET /spending-trends` - Spending trends
- `GET /category-breakdown` - Category breakdown
- `GET /monthly-report` - Monthly report
- `GET /yearly-report` - Yearly report

## Validation Methods

### 1. Automated Testing (Recommended)

#### Run Unit/Integration Tests
```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

The test suite includes:
- Health check validation
- Authentication flow testing
- Protected route access validation
- CRUD operations for expenses and categories
- Analytics endpoint testing
- Error handling verification

#### Test Coverage
- **System endpoints**: Health check and API info
- **Authentication**: Signup, login, token management
- **Authorization**: Protected route access
- **Business logic**: Expense and category operations
- **Analytics**: Data aggregation endpoints
- **Error handling**: Invalid requests, missing tokens

### 2. Shell Script Validation

#### Quick Endpoint Validation
```bash
# Make the script executable (one-time)
chmod +x scripts/validate-endpoints.sh

# Run the validation script
./scripts/validate-endpoints.sh
```

This script:
- Checks if the server is running
- Tests all endpoints with appropriate HTTP methods
- Validates authentication flow
- Tests protected routes with and without tokens
- Provides colored output for easy reading
- Returns exit code for CI/CD integration

### 3. Manual Testing

#### Using curl Commands
```bash
# Health check
curl http://localhost:3001/health

# API information
curl http://localhost:3001/api

# User signup
curl -X POST http://localhost:3001/api/v1/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!","name":"Test User"}'

# User login
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# Get user profile (requires token)
TOKEN="your-access-token-here"
curl -X GET http://localhost:3001/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"

# Get expenses
curl -X GET http://localhost:3001/api/v1/expenses \
  -H "Authorization: Bearer $TOKEN"

# Create expense
curl -X POST http://localhost:3001/api/v1/expenses \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount":50.00,"description":"Test expense","categoryId":"category-id","date":"2024-01-01"}'
```

### 4. API Documentation Tools

#### Using Postman/Insomnia
1. Import the following collection:
   - Base URL: `http://localhost:3001`
   - Authentication: Bearer Token
2. Set up environments for:
   - Development: `http://localhost:3001`
   - Production: Your production URL
3. Create collections for each route group:
   - Authentication
   - Expenses
   - Categories
   - Analytics

#### Using Swagger/OpenAPI
The API info endpoint (`GET /api`) provides basic documentation. For comprehensive API documentation, consider adding Swagger/OpenAPI support.

## Environment Setup

### Required Environment Variables
```bash
# Database
DATABASE_URL="your-database-connection-string"

# JWT Secrets
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"

# Server Configuration
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# (Optional) Open Prisma Studio
npm run db:studio
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: API Endpoint Validation
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

### Pre-commit Hooks
```bash
# Install husky
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm test"
```

## Troubleshooting

### Common Issues

#### Server Not Running
```bash
# Start development server
npm run dev

# Check if port is in use
lsof -i :3001
```

#### Database Connection Issues
```bash
# Check database URL
echo $DATABASE_URL

# Reset database
npm run db:migrate reset
```

#### Authentication Issues
```bash
# Check JWT secrets
echo $JWT_SECRET
echo $JWT_REFRESH_SECRET

# Verify token format
echo $TOKEN | jq -R 'split(".") | .[1] | @base64d | fromjson'
```

#### Test Failures
```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- src/tests/endpoints.test.ts

# Debug with console logs
DEBUG=* npm test
```

## Performance Monitoring

### Response Time Validation
```bash
# Measure response times
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/health
```

Create `curl-format.txt`:
```
     time_namelookup:  %{time_namelookup}\n
        time_connect:  %{time_connect}\n
     time_appconnect:  %{time_appconnect}\n
    time_pretransfer:  %{time_pretransfer}\n
       time_redirect:  %{time_redirect}\n
  time_starttransfer:  %{time_starttransfer}\n
                     ----------\n
          time_total:  %{time_total}\n
```

### Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery run load-test.yml
```

## Best Practices

1. **Test Environment**: Always use a separate test database
2. **Data Cleanup**: Clean up test data after each test run
3. **Token Management**: Use fresh tokens for each test session
4. **Error Cases**: Test both success and failure scenarios
5. **Rate Limiting**: Consider rate limiting in automated tests
6. **CI/CD Integration**: Automate endpoint validation in deployment pipelines

## Next Steps

1. Set up the test environment
2. Run the automated test suite
3. Use the shell script for quick validation
4. Integrate with CI/CD pipeline
5. Monitor endpoint performance in production
