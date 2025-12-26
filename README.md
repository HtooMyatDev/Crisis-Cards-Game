# Crisis Cards Game App

A collaborative, real-time strategy card game where players work in teams to solve global crises. Built with **Next.js 14**, **Prisma**, **PostgreSQL**, and **Pusher**.

![Crisis Cards Banner](https://via.placeholder.com/1200x400?text=Crisis+Cards+Game)

## Features

### 🎮 Gameplay
- **Hybrid Real-time System**: Instant updates using Pusher Websockets with robust polling fallback.
- **Team-Based Strategy**: Players are assigned teams (Red, Blue, etc.) with shared budgets and scores.
- **Role-Based Mechanics**: Rotational "Leader" system where one player makes the final call after team deliberation.
- **Dynamic Phases**: Lobby -> Team Assignment -> Leader Election -> Decision Phase -> Results.

### 🛠 Host Controls
- **Optimistic UI**: Instant-feedback controls for pausing, resuming, and advancing cards.
- **Live Dashboard**: Watch player submissions and team stats update in real-time.
- **Full Customization**: Create custom scenarios (cards), categories, and game modes.

### 🎨 UX & Design
- **Neo-Brutalist / Modern UI**: Distinctive aesthetic with heavy borders and bold shadows.
- **Mobile First**: Fully optimized for players on smartphones.
- **Smooth Transitions**: Cinematic fade transitions between game phases.
- **Smooth Transitions**: Cinematic fade transitions between game phases.
- **Immersive Audio**: Sound effects for key game events (Lobby Join, Timer, Alerts).

### ⚡️ Performance
- **Redis Caching**: Host view calls are cached to support 1000+ concurrent users.
- **Optimized Database**: strategic indexing for fast queries.

---

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (via Prisma ORM)
- **Real-time**: Pusher Channels (WebSockets)
- **Caching**: Redis (Upstash / Local)
- **Styling**: Tailwind CSS + Framer Motion
- **Icons**: Lucide React

---

## Getting Started

### 1. Clone & Install
```bash
git clone <repository-url>
cd crisis-card-game-app
npm install
```

### 2. Database Setup
Ensure you have a PostgreSQL database running (local or cloud like database.new).

```bash
# Create .env file
cp .env.example .env
```

Update `.env` with your database URL:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/crisis_game"
```

Run migrations and seed data:
```bash
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
```

npx ts-node prisma/seed.ts
```

### 3. Real-time Setup (Pusher)
To enable instant updates (highly recommended), create a free app on [pusher.com](https://pusher.com) and add the keys to `.env`.

### 4. Caching Setup (Redis) - Optional
To enable high-performance caching for the Host View:
1.  Install Redis locally or use [Upstash](https://upstash.com).
2.  Add `REDIS_URL` to your `.env` file (see `.env.example`).
*If skipped, the app gracefully falls back to direct DB calls.*

### 5. Sound Effects Setup (Optional)

```env
NEXT_PUBLIC_PUSHER_KEY=your_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
PUSHER_APP_ID=your_app_id
PUSHER_SECRET=your_secret
```
*If skipped, the app will fall back to 3-second polling.*

### 4. Sound Effects Setup (Optional)
To enable audio feedback, place the following .wav files in `public/sounds/`:
- `join.wav` (Player joined)
- `notification.wav` (Next card)
- `tick.wav` (Timer countdown)
- `success.wav` (Game completed)

*Free assets can be found on Mixkit or Pixabay.*

### 6. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

- `src/app`: App Router pages and API routes.
    - `/api/game`: Player-facing endpoints (join, vote, submit).
    - `/api/admin`: Host/Admin management endpoints.
- `src/components`:
    - `/game`: Core game views (Lobby, Decision, Results).
    - `/admin`: Dashboard widgets and management tables.
- `src/lib`:
    - `pusher.ts`: Server-side WebSocket trigger.
    - `pusher-client.ts`: Client-side WebSocket listener.
- `src/hooks`: Custom hooks (`useGamePolling`, `useGameState`).

## Deployment

Deploy easily on **Vercel**.
1. Import project to Vercel.
2. Add Environment Variables (`DATABASE_URL`, `PUSHER_...`).
3. Deploy!
