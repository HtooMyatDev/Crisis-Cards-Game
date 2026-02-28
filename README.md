# Cards of Crisis 🌍

**Cards of Crisis** is a collaborative, real-time simulation game designed for **The Change Lab** and **Doing More With Less**. Our organization aims to foster environmental awareness and sustainability through interactive workshops and immersive simulations.

In this high-stakes strategy game, players work in teams to manage resources, make critical policy decisions, and navigate global environmental and societal crises.

![Cards of Crisis Logo](https://via.placeholder.com/1200x400?text=Cards+of+Crisis)

---

## 🏛 Mission & Impact

The project serves as a cornerstone for environmental workshops, helping participants understand the complexity of:
- **Resource Management**: Balancing economic growth with environmental preservation.
- **Crisis Response**: Reacting to toxic spills, climate events, and societal shifts.
- **Collaborative Leadership**: Building consensus in a time-pressured environment.

---

## 🎮 Game Features

- **Hybrid Real-time System**: Instant updates via Pusher Channels with robust polling fallbacks.
- **Team-Based Strategy**: Adaptive scoring and shared budgets across discrete teams.
- **Role-Based Mechanics**: A rotational "Leader" system ensures everyone participates in the final decision-making process.
- **Dynamic Phases**: Seamless transitions from Lobby → Role Assignment → Policy Deliberation → Crisis Resolution.
- **Neo-Brutalist Design**: A premium, "Cards of Crisis" signature aesthetic with bold shadows, heavy borders, and high-contrast visuals.

---

## 🛠 Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router & Turbopack)
- **Runtime**: [React 19](https://react.dev/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) via [Prisma ORM](https://www.prisma.io/)
- **Real-time**: [Pusher](https://pusher.com/) (WebSockets)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) & [Framer Motion](https://www.framer.com/motion/)
- **State & Logic**: [Zod](https://zod.dev/) (Validation), [Lucide React](https://lucide.dev/) (Icons)

---

## 🏗 System Structure

```text
src/
├── app/                  # Next.js App Router (Pages & API)
│   ├── (auth)/           # Authentication flows (Login/Register)
│   ├── admin/            # Host & Workshop management dashboards
│   ├── user/             # Player profile and history
│   ├── live/             # Real-time game simulation interface
│   └── api/              # Backend endpoints
│       ├── game/         # Game logic (voting, submissions, state)
│       └── admin/        # CRUD operations for cards/scenarios
├── components/           # Reusable UI components
│   ├── game/             # Core simulation views (Lobby, Decision, Results)
│   ├── admin/            # Dashboard widgets and analytics
│   └── ui/               # Base design system (Buttons, Cards, Inputs)
├── lib/                  # Shared utilities
│   ├── prisma.ts         # Database client
│   └── pusher.ts         # Real-time event broadcasting
├── hooks/                # Custom React hooks (Game state, polling)
└── types/                # TypeScript interface definitions
```

---

## 🚀 Getting Started

### 1. Installation
```bash
git clone <repository-url>
cd crisis-card-game-app
npm install
```

### 2. Database Initialization
1.  Copy `.env.example` to `.env`.
2.  Update `DATABASE_URL` with your PostgreSQL connection string.
3.  Run migrations and seed the initial scenarios:
```bash
npx prisma db push
npm run postinstall
npx ts-node prisma/seed.ts
```

### 3. Real-time Setup
Create a [Pusher](https://pusher.com) app and add your credentials to `.env`:
- `NEXT_PUBLIC_PUSHER_KEY`
- `NEXT_PUBLIC_PUSHER_CLUSTER`
- `PUSHER_APP_ID`
- `PUSHER_SECRET`

### 4. Run Development
```bash
npm run dev
```

---

## 🏗 Deployment
This application is optimized for [Vercel](https://vercel.com). Ensure all environment variables (DB, Pusher, Auth Secrets) are configured in the Vercel dashboard.

---

**Doing More With Less (DMWL)** | *The Change Lab*
