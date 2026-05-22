# IU Expense Tracker

A full-stack expense tracking application that helps users manage their personal finances. Users can sign in, log expenses with custom categories and emoji icons, view spending summaries over different time periods, and switch between light and dark themes.

---

## Project Structure

This is a **monorepo** containing two separate applications:

```
iu-expense-app/
├── backend/    # REST API server (Express.js + PostgreSQL)
├── frontend/   # Web application (Next.js + React)
└── README.md   # You are here
```

| Folder | Description | Docs |
|---|---|---|
| [`backend/`](./backend) | Handles authentication, expense CRUD, categories, and analytics | [Backend README](./backend/README.md) |
| [`frontend/`](./frontend) | The user-facing web app with login, dashboard, and expense management | [Frontend README](./frontend/README.md) |

---

## Tech Stack Overview

### Backend
- **Node.js** + **Express.js** — REST API
- **TypeScript** — Type-safe JavaScript
- **PostgreSQL** + **Prisma** — Database and ORM
- **JWT** — Authentication
- **Zod** — Input validation

### Frontend
- **Next.js 16** — React framework (App Router)
- **React 19** + **TypeScript**
- **TailwindCSS 4** — Styling
- **React Query** — Data fetching and caching
- **NextAuth.js** — Authentication

---

## Getting Started

### Prerequisites

- **Node.js** v18 or higher — [Download](https://nodejs.org/)
- **PostgreSQL** 15 or higher — [Download](https://www.postgresql.org/download/)
- **pnpm** (recommended for the frontend) — `npm install -g pnpm`

### Quick Start

1. **Clone the repo**
   ```bash
   git clone https://github.com/Young-Einstein10/iu-expense-app.git
   cd iu-expense-app
   ```

2. **Set up the backend** — Follow the [Backend README](./backend/README.md) to install dependencies, configure the database, and start the API server.

3. **Set up the frontend** — Follow the [Frontend README](./frontend/README.md) to install dependencies, configure environment variables, and start the dev server.

> **Note:** The backend must be running before the frontend can fetch data.

---

## License

This project is for educational purposes as part of the IU coursework.