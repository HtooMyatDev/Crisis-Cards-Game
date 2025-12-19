# Crisis Cards Game App

A collaborative, real-time strategy card game where players work in teams to solve global crises. Built with **Next.js 14**, **Prisma**, **PostgreSQL**, and **Tailwind CSS**.

## Features

- **Real-time Gameplay**: Vote on team leaders, make timed decisions, and see live results.
- **Team Management**: Dynamic team assignment, budget tracking, and role-based gameplay.
- **Admin Dashboard**: Comprehensive control over games, cards, categories, and users.
- **Responsive Design**: Mobile-first UI optimized for any device.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS, Lucide Icons
- **State Management**: Custom React Hooks

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd crisis-card-game-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env` file in the root:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/crisis_game"
   # Add other required vars (AUTH_SECRET, etc.)
   ```

4. **Database Setup:**
   ```bash
   npx prisma generate
   npx prisma db push
   # Optional: Seed data
   npx ts-node prisma/seed.ts
   ```

5. **Run Development Server:**
   ```bash
   npm run dev
   ```

## Project Structure

- `src/app`: App Router pages and API routes.
- `src/components`: Reusable UI components (Game, Admin, UI).
- `src/hooks`: Custom hooks (`useGameSession`, `useGameState`).
- `src/services`: API service layer (`gameService.ts`).
- `prisma`: Database schema and migrations.

## Deployment

Deploy easily on **Vercel** or any Node.js compatible host. Ensure your database is accessible (e.g., via Supabase or Railway).
