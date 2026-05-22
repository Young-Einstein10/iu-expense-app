# IU Expense Tracker — Frontend

A modern expense tracking app built with Next.js, React, and TailwindCSS. This is the **frontend** (the part users see and interact with in the browser).

---

## What Does This App Do?

- Lets users **sign in** to their account
- **Add, view, and manage expenses** with categories and emojis
- See a **total spent** summary filtered by time duration
- View a **transaction list** of all recorded expenses
- Supports **dark mode** theming

---

## Tech Stack (What's Under the Hood)

| Technology | What It Does |
|---|---|
| [Next.js 16](https://nextjs.org/) | React framework that handles routing, server rendering, and more |
| [React 19](https://react.dev/) | Library for building user interfaces with components |
| [TypeScript](https://www.typescriptlang.org/) | Adds type safety to JavaScript (catches bugs early) |
| [TailwindCSS 4](https://tailwindcss.com/) | Utility-first CSS framework for styling |
| [React Query](https://tanstack.com/query) | Manages data fetching, caching, and syncing with the backend |
| [NextAuth.js](https://next-auth.js.org/) | Handles user authentication (login/logout) |
| [Lucide React](https://lucide.dev/) | Icon library |

---

## Prerequisites

Before you start, make sure you have these installed on your computer:

1. **Node.js** (v18 or higher) — [Download here](https://nodejs.org/)
2. **pnpm** (package manager) — Install by running:
   ```bash
   npm install -g pnpm
   ```
3. The **backend server** (`iu-expense-app-be`) should be running — the frontend talks to it for data.

---

## Getting Started

### 1. Install dependencies

Open your terminal, navigate to this folder (`iu-expense-app-fe`), and run:

```bash
pnpm install
```

This downloads all the libraries the project needs (listed in `package.json`).

### 2. Set up environment variables

Create a file called `.env.local` in this folder. This file stores secrets and config that shouldn't be committed to Git. You'll need:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```

> **Tip:** Ask a team member for the correct values, or generate a secret with `openssl rand -base64 32`.

### 3. Start the development server

```bash
pnpm dev
```

Then open [http://localhost:3000](http://localhost:3000) in your browser. You should see the app!

> **Hot reload:** When you edit and save a file, the browser automatically updates — no need to refresh manually.

---

## Project Structure (Where Things Live)

```
iu-expense-app-fe/
├── app/                    # Pages and routing (Next.js App Router)
│   ├── layout.tsx          # Root layout (wraps every page)
│   ├── page.tsx            # Home page (what you see at "/")
│   ├── providers.tsx       # Sets up React Query, auth, etc.
│   ├── login/              # Login page
│   └── api/                # API route handlers
│
├── components/             # Reusable UI pieces
│   ├── CategoryInput.tsx   # Category picker with emoji support
│   ├── ExpenseModal.tsx    # Modal form to add/edit expenses
│   ├── Navbar.tsx          # Top navigation bar
│   ├── TotalSpent.tsx      # Displays total spending summary
│   └── TransactionList.tsx # Lists all transactions
│
├── contexts/               # Global state shared across components
│   ├── AuthContext.tsx     # Who is logged in?
│   ├── DurationContext.tsx # Selected time filter (week/month/year)
│   ├── ExpenseContext.tsx  # Expense data state
│   └── ThemeContext.tsx    # Dark/light mode
│
├── package.json            # Project config & dependency list
└── tailwind.config.ts      # TailwindCSS configuration
```

---

## Available Commands

Run these from the `iu-expense-app-fe` folder:

| Command | What It Does |
|---|---|
| `pnpm dev` | Starts the app in development mode (with hot reload) |
| `pnpm build` | Creates an optimized production build |
| `pnpm start` | Runs the production build locally |
| `pnpm lint` | Checks your code for common errors and style issues |

---

## How to Make Changes

1. **Find the right file** — Use the project structure above to locate what you want to change.
2. **Edit and save** — The browser will automatically reload with your changes.
3. **Check for errors** — Look at your terminal and browser console for any red error messages.

### Common tasks:

- **Change the home page?** Edit `app/page.tsx`
- **Update the navigation bar?** Edit `components/Navbar.tsx`
- **Add a new page?** Create a folder in `app/` with a `page.tsx` file inside (e.g., `app/settings/page.tsx` creates the `/settings` route)
- **Change styles?** Use [TailwindCSS classes](https://tailwindcss.com/docs) directly in the JSX (e.g., `className="text-red-500 font-bold"`)

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `command not found: pnpm` | Install pnpm: `npm install -g pnpm` |
| Blank page or errors on load | Make sure the backend is running |
| `Module not found` error | Run `pnpm install` to install missing packages |
| Port 3000 already in use | Stop the other process or run `pnpm dev -- -p 3001` |
| Styles not updating | Try restarting the dev server (`Ctrl+C` then `pnpm dev`) |

---

## Learn More

- [Next.js Documentation](https://nextjs.org/docs) — Learn about the framework
- [React Documentation](https://react.dev/) — Learn about components, hooks, and state
- [TailwindCSS Documentation](https://tailwindcss.com/docs) — Learn how to style with utility classes
- [React Query Documentation](https://tanstack.com/query/latest/docs) — Learn about data fetching
- [Learn Next.js](https://nextjs.org/learn) — Free interactive tutorial (great for beginners!)
