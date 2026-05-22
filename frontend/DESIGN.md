# Expense Tracker - Design Document

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Frontend Design](#frontend-design)
3. [Backend Design](#backend-design)
4. [Database Schema](#database-schema)
5. [API Design](#api-design)
6. [Authentication & Security](#authentication--security)
7. [State Management](#state-management)
8. [Component Architecture](#component-architecture)
9. [Data Flow](#data-flow)
10. [Error Handling](#error-handling)
11. [Performance Optimization](#performance-optimization)
12. [Deployment Architecture](#deployment-architecture)

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Client    │    │   Mobile App    │    │   Admin Panel   │
│  (Next.js App)  │    │ (React Native)  │    │  (Future)       │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │      API Gateway         │
                    │   (Express.js API)   │
                    └─────────────┬─────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     Express.js Backend    │
                    │  ┌─────────────────────┐  │
                    │  │   PostgreSQL DB     │  │
                    │  │   Auth Service      │  │
                    │  │   File Storage      │  │
                    │  └─────────────────────┘  │
                    └───────────────────────────┘
```

## Frontend Design

### Technology Stack
- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **State Management**: React Context API + Zustand (future)
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: TanStack Query (for API calls)
- **Icons**: Lucide React
- **Charts**: Recharts (for analytics)
- **Testing**: Jest + React Testing Library + Playwright

### Project Structure
```
src/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route groups for authentication
│   │   ├── login/
│   │   └── signup/
│   ├── dashboard/                # Main dashboard
│   │   └── page.tsx
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   ├── expenses/
│   │   └── categories/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Landing/redirect page
├── components/                   # Reusable components
│   ├── ui/                       # Base UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── modal.tsx
│   │   └── dropdown.tsx
│   ├── layout/                   # Layout components
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   └── footer.tsx
│   ├── features/                 # Feature-specific components
│   │   ├── expenses/
│   │   │   ├── expense-list.tsx
│   │   │   ├── expense-form.tsx
│   │   │   └── expense-card.tsx
│   │   ├── analytics/
│   │   │   ├── spending-chart.tsx
│   │   │   └── category-breakdown.tsx
│   │   └── categories/
│   │       ├── category-selector.tsx
│   │       └── category-manager.tsx
├── contexts/                     # React contexts
│   ├── auth-context.tsx
│   ├── expense-context.tsx
│   ├── theme-context.tsx
│   └── notification-context.tsx
├── hooks/                        # Custom hooks
│   ├── use-auth.ts
│   ├── use-expenses.ts
│   ├── use-local-storage.ts
│   ├── use-debounce.ts
│   └── use-click-outside.ts
├── lib/                          # Utility libraries
│   ├── utils.ts
│   ├── validations.ts
│   ├── api-client.ts
│   ├── constants.ts
│   └── formatters.ts
├── types/                        # TypeScript definitions
│   ├── auth.ts
│   ├── expense.ts
│   ├── category.ts
│   ├── api.ts
│   └── index.ts
└── styles/                       # Global styles
    ├── components.css
    └── utilities.css
```

### Component Design Patterns

#### 1. Atomic Design Structure
```typescript
// atoms/index.ts - Smallest indivisible components
export { Button } from './button';
export { Input } from './input';
export { Icon } from './icon';

// molecules/index.ts - Combination of atoms
export { ExpenseCard } from './expense-card';
export { CategoryBadge } from './category-badge';

// organisms/index.ts - Complex components
export { ExpenseList } from './expense-list';
export { Dashboard } from './dashboard';

// templates/index.ts - Page layouts
export { DashboardLayout } from './dashboard-layout';

// pages/index.ts - Complete pages
export { DashboardPage } from './dashboard-page';
```

#### 2. Feature-Based Component Structure
```typescript
// features/expenses/index.ts
export { ExpenseList } from './expense-list';
export { ExpenseForm } from './expense-form';
export { ExpenseDetails } from './expense-details';
export { useExpenses } from './use-expenses';
```

### State Management Architecture

#### Phase 1: Local Storage (Current)
```typescript
// contexts/expense-context.tsx
interface ExpenseContextType {
  expenses: Expense[];
  categories: Category[];
  loading: boolean;
  error: string | null;
  actions: {
    addExpense: (expense: CreateExpenseData) => Promise<void>;
    updateExpense: (id: string, data: UpdateExpenseData) => Promise<void>;
    deleteExpense: (id: string) => Promise<void>;
    syncExpenses: () => Promise<void>;
  };
}
```

#### Phase 2: Supabase Integration
```typescript
// hooks/use-expenses.ts (with TanStack Query)
export const useExpenses = () => {
  return useQuery({
    queryKey: ['expenses'],
    queryFn: fetchExpenses,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      toast.success('Expense added successfully');
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
};
```

### UI/UX Design System

#### 1. Design Tokens
```typescript
// lib/design-tokens.ts
export const tokens = {
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      600: '#2563eb',
      900: '#1e3a8a',
    },
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      // ... more shades
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
    },
  },
};
```

#### 2. Component Variants
```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white hover:bg-primary-700',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        outline: 'border border-gray-300 bg-white hover:bg-gray-50',
        ghost: 'hover:bg-gray-100',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
);
```

## Backend Design

### Technology Stack
- **Runtime**: Node.js 18.x
- **Framework**: Express.js 4.x
- **Database**: PostgreSQL 15
- **ORM**: Prisma or Sequelize
- **Authentication**: JWT + Passport.js
- **File Storage**: AWS S3 or Cloudinary
- **API**: RESTful
- **Validation**: Joi or Zod
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest + Supertest

### Express.js Server Structure
```typescript
// server.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import routes
import authRoutes from './routes/auth';
import expenseRoutes from './routes/expenses';
import categoryRoutes from './routes/categories';
import analyticsRoutes from './routes/analytics';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { app };
```

### Project Structure (Backend)
```text
backend/
├── src/
│   ├── controllers/           # Route handlers
│   │   ├── authController.ts
│   │   ├── expenseController.ts
│   │   └── categoryController.ts
│   ├── middleware/            # Custom middleware
│   │   ├── auth.ts
│   │   ├── errorHandler.ts
│   │   ├── validation.ts
│   │   └── notFound.ts
│   ├── models/               # Database models
│   │   ├── User.ts
│   │   ├── Expense.ts
│   │   └── Category.ts
│   ├── routes/               # API routes
│   │   ├── auth.ts
│   │   ├── expenses.ts
│   │   └── categories.ts
│   ├── services/             # Business logic
│   │   ├── authService.ts
│   │   ├── expenseService.ts
│   │   └── emailService.ts
│   ├── utils/                # Utility functions
│   │   ├── jwt.ts
│   │   ├── validation.ts
│   │   └── helpers.ts
│   ├── config/               # Configuration
│   │   ├── database.ts
│   │   └── redis.ts
│   ├── types/                # TypeScript types
│   │   └── index.ts
│   └── app.ts                # Express app setup
├── tests/                    # Test files
├── prisma/                   # Prisma files
│   ├── schema.prisma
│   └── migrations/
├── docker/                   # Docker files
├── package.json
└── tsconfig.json
```

### Database Schema

#### Core Tables
```sql
-- Users table
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses table
CREATE TABLE expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  date DATE NOT NULL,
  receipt_url TEXT,
  tags TEXT[], -- PostgreSQL array for tags
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Budgets table (future feature)
CREATE TABLE budgets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  period TEXT NOT NULL CHECK (period IN ('monthly', 'weekly', 'yearly')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recurring expenses table (future feature)
CREATE TABLE recurring_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  next_due_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Indexes for Performance
```sql
-- Optimize for common queries
CREATE INDEX idx_expenses_user_date ON expenses(user_id, date DESC);
CREATE INDEX idx_expenses_category ON expenses(category_id);
CREATE INDEX idx_categories_user ON categories(user_id);
CREATE INDEX idx_expenses_amount_range ON expenses(user_id, amount) WHERE amount > 100;

-- Full-text search on descriptions
CREATE INDEX idx_expenses_description_fts ON expenses USING gin(to_tsvector('english', description));
```

#### Authorization Middleware
```typescript
// middleware/auth.ts
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user as any;
    next();
  });
};

// Resource ownership middleware
export const requireOwnership = (resourceIdParam = 'id') => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const resourceId = req.params[resourceIdParam];
    const userId = req.user!.id;
    
    // Check if user owns the resource
    const resource = await db.expense.findFirst({
      where: {
        id: resourceId,
        userId: userId,
      },
    });
    
    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }
    
    next();
  };
};
```

### API Design

#### RESTful API Endpoints
```typescript
// API Routes Structure
/api/v1/
├── auth/
│   ├── POST /login
│   ├── POST /signup
│   ├── POST /logout
│   └── GET /me
├── expenses/
│   ├── GET /expenses
│   ├── POST /expenses
│   ├── GET /expenses/:id
│   ├── PUT /expenses/:id
│   ├── DELETE /expenses/:id
│   └── GET /expenses/summary
├── categories/
│   ├── GET /categories
│   ├── POST /categories
│   ├── PUT /categories/:id
│   └── DELETE /categories/:id
├── budgets/
│   ├── GET /budgets
│   ├── POST /budgets
│   ├── PUT /budgets/:id
│   └── DELETE /budgets/:id
└── analytics/
    ├── GET /analytics/spending-trends
    ├── GET /analytics/category-breakdown
    └── GET /analytics/monthly-report
```

#### API Response Format
```typescript
// Standard API Response
interface ApiResponse<T> {
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
  };
}

// Example: GET /api/v1/expenses
interface ExpensesResponse extends ApiResponse<Expense[]> {
  meta: {
    pagination: PaginationMeta;
    filters: {
      dateRange: {
        start: string;
        end: string;
      };
      categories?: string[];
    };
    summary: {
      total: number;
      count: number;
      average: number;
    };
  };
}
```

#### GraphQL Schema (Optional)
```graphql
type Query {
  expenses(
    filter: ExpenseFilter
    pagination: PaginationInput
  ): ExpenseConnection!
  categories: [Category!]!
  analytics(filter: AnalyticsFilter): Analytics!
  me: User!
}

type Mutation {
  createExpense(input: CreateExpenseInput!): Expense!
  updateExpense(id: ID!, input: UpdateExpenseInput!): Expense!
  deleteExpense(id: ID!): Boolean!
  createCategory(input: CreateCategoryInput!): Category!
}

type Subscription {
  expenseAdded(userId: ID!): Expense!
  expenseUpdated(userId: ID!): Expense!
  expenseDeleted(userId: ID!): ID!
}
```

## Authentication & Security

### Authentication Flow
```typescript
// Authentication Context
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  actions: {
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, metadata?: UserMetadata) => Promise<void>;
    signOut: () => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
    updateProfile: (data: UpdateProfileData) => Promise<void>;
  };
}

// Express.js Auth API
// POST /api/v1/auth/login
const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // Validate user credentials
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !await bcrypt.compare(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  
  // Generate JWT tokens
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );
  
  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );
  
  res.json({
    user: { id: user.id, email: user.email, fullName: user.fullName },
    tokens: { accessToken, refreshToken }
  });
};

// POST /api/v1/auth/signup
const signup = async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body;
  
  // Check if user exists
  const existingUser = await db.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(409).json({ error: 'User already exists' });
  }
  
  // Hash password and create user
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { email, passwordHash, fullName }
  });
  
  // Generate tokens
  const accessToken = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );
  
  res.status(201).json({
    user: { id: user.id, email: user.email, fullName: user.fullName },
    tokens: { accessToken }
  });
};
```

### Security Measures
1. **JWT Tokens**: Short-lived access tokens with refresh tokens
2. **Password Hashing**: bcrypt with salt rounds
3. **Input Validation**: Zod schemas for all inputs
4. **Rate Limiting**: express-rate-limit middleware
5. **CORS**: cors middleware configuration
6. **HTTPS**: Enforced SSL/TLS with helmet.js
7. **Environment Variables**: Secure secret management with dotenv
8. **SQL Injection Prevention**: ORM/parameterized queries
9. **XSS Protection**: Input sanitization and CSP headers

## Data Flow

### Expense Creation Flow
```
User Input → Form Validation → API Request → Database → UI Refresh
     ↓              ↓              ↓            ↓           ↓
  Zod Schema → Client-side → Express.js → PostgreSQL → React Query
```
## Error Handling

### Error Boundaries
```typescript
// components/error-boundary.tsx
class ErrorBoundary extends Component<Props, State> {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error reporting service
    Sentry.captureException(error, { extra: errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
            <p className="mt-2 text-gray-600">We're working to fix this issue.</p>
            <Button onClick={this.resetError} className="mt-4">
              Try again
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handling
```typescript
// lib/api-client.ts
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const handleApiError = (error: any): never => {
  if (error.status) {
    throw new ApiError(
      error.message || 'An error occurred',
      error.status,
      error.code || 'UNKNOWN_ERROR',
      error.details
    );
  }
  throw new ApiError('Network error', 0, 'NETWORK_ERROR');
};
```

## Performance Optimization

### Frontend Optimizations
1. **Code Splitting**: Route-based and component-based
2. **Lazy Loading**: Components and images
3. **Memoization**: React.memo, useMemo, useCallback
4. **Virtual Scrolling**: For large expense lists
5. **Caching**: Service worker for offline support
6. **Bundle Optimization**: Tree shaking and minification

### Backend Optimizations
1. **Database Indexes**: Optimized query performance
2. **Connection Pooling**: Efficient database connections
3. **Caching**: Redis for frequently accessed data
4. **CDN**: Static asset delivery
5. **Compression**: Gzip/Brotli for API responses

## Deployment Architecture

### Frontend Deployment (Netlify)
```yaml
# netlify.toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "https://api.expense-tracker.com/api/:splat"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
```

### Backend Deployment (AWS/Heroku)
```yaml
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=expense_tracker
      - POSTGRES_USER=${DB_USER}
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

volumes:
  postgres_data:
  redis_data:
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test
      - run: npm run lint
      - run: npm run type-check

  test-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd backend && npm ci
      - run: cd backend && npm run test
      - run: cd backend && npm run lint

  deploy-frontend:
    needs: test-frontend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --prod --dir=.next
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}

  deploy-backend:
    needs: test-backend
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: ${{ secrets.HEROKU_APP_NAME }}
          heroku_email: ${{ secrets.HEROKU_EMAIL }}
```

## Monitoring & Analytics

### Application Monitoring
1. **Error Tracking**: Sentry (frontend + backend)
2. **Performance**: New Relic / DataDog
3. **Uptime**: UptimeRobot
4. **Logs**: Winston + ELK Stack
5. **API Monitoring**: Postman/Insight

### Business Metrics
1. **User Acquisition**: Sign-ups, sources
2. **Engagement**: Daily active users, expenses per user
3. **Retention**: 7-day, 30-day retention rates
4. **Feature Usage**: Category usage, frequency of adding expenses

## Future Enhancements

### Phase 2: Advanced Features
1. **Budget Management**: Set and track spending limits
2. **Recurring Expenses**: Automated recurring transactions
3. **Receipt OCR**: Extract data from receipt images
4. **Bank Integration**: Plaid API for automatic transaction import
5. **Multi-currency**: Support for different currencies

### Phase 3: Enterprise Features
1. **Team Accounts**: Shared expense tracking for teams
2. **Advanced Reporting**: CSV/PDF export, custom reports
3. **Integrations**: Accounting software, budget apps
4. **API Access**: Public API for third-party integrations
5. **White-label**: Custom branding for businesses

This design document provides a comprehensive blueprint for implementing the Expense Tracker application with scalability, maintainability, and best practices in mind.
