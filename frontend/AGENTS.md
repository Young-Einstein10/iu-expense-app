# Frontend Development Guidelines (React + Next.js)

## Project Overview
This is a production-level React/Next.js frontend for the IU Expense Tracker application using TypeScript, TailwindCSS, and React Query.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: React Context + React Query
- **Authentication**: NextAuth.js
- **Icons**: Lucide React
- **Data Fetching**: @tanstack/react-query

## Code Style & Conventions

### File Structure
```
app/
├── (routes)/        # Page routes
├── api/             # API routes (if any)
├── layout.tsx       # Root layout
├── page.tsx         # Home page
└── providers.tsx    # Client providers wrapper

components/
├── ui/              # Reusable UI components
└── [Feature].tsx    # Feature-specific components

contexts/
└── [Name]Context.tsx

hooks/
└── use[Name].ts

lib/
├── api.ts           # API client
└── utils.ts         # Utility functions

types/
└── index.ts         # TypeScript types
```

### Naming Conventions
- **Components**: PascalCase (e.g., `ExpenseModal.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useExpenses.ts`)
- **Contexts**: PascalCase with `Context` suffix (e.g., `AuthContext.tsx`)
- **Utilities**: camelCase (e.g., `formatCurrency.ts`)
- **Types/Interfaces**: PascalCase (e.g., `Expense`, `CreateExpenseDto`)

### Component Guidelines
- Use functional components with hooks
- Prefer composition over inheritance
- Keep components small and focused (single responsibility)
- Extract reusable logic into custom hooks
- Use TypeScript for all components with proper prop types

### React Query Usage
```typescript
// Queries
const { data, isLoading, error } = useQuery({
  queryKey: ['expenses'],
  queryFn: () => api.getExpenses(),
  enabled: isAuthenticated,
});

// Mutations
const mutation = useMutation({
  mutationFn: (data) => api.createExpense(data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['expenses'] });
  },
});
```

### State Management
- Use React Query for server state (API data)
- Use React Context for global client state (auth, theme)
- Use local state (useState) for component-specific state
- Avoid prop drilling - use context or composition

### Styling with TailwindCSS
- Use utility classes directly in JSX
- Extract repeated patterns to components, not CSS
- Use `cn()` helper for conditional classes
- Follow mobile-first responsive design
- Use CSS variables for theming (dark mode)

### Data Fetching
- Use React Query for all API calls
- Implement proper loading and error states
- Use optimistic updates for better UX
- Cache and invalidate data appropriately
- Handle offline scenarios gracefully

### Authentication
- Use NextAuth.js for authentication
- Protect routes with middleware or guards
- Store tokens securely (httpOnly cookies preferred)
- Handle token refresh automatically
- Redirect unauthenticated users appropriately

### Error Handling
- Use error boundaries for component errors
- Display user-friendly error messages
- Log errors for debugging
- Provide retry mechanisms where appropriate

### Performance
- Use React.memo for expensive components
- Implement proper key props in lists
- Lazy load routes and heavy components
- Optimize images with next/image
- Minimize bundle size

### Accessibility
- Use semantic HTML elements
- Include proper ARIA attributes
- Ensure keyboard navigation works
- Maintain sufficient color contrast
- Test with screen readers

### Forms
- Use controlled components
- Implement client-side validation
- Show inline validation errors
- Disable submit during loading
- Handle submission errors gracefully

## Commands
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint

## Best Practices
1. Mark client components with `"use client"` directive
2. Prefer Server Components where possible
3. Co-locate related files (component + styles + tests)
4. Use absolute imports with `@/` prefix
5. Write self-documenting code
6. Handle all loading and error states
7. Test critical user flows
8. Keep bundle size minimal
9. Use TypeScript strict mode
10. Follow React 19 best practices (no forwardRef needed, etc.)
