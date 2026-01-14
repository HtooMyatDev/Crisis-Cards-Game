# Achievements System Documentation

## 1. Overview
The achievements module (`src/lib/achievements.ts`) provides a framework for defining, seeding, and evaluating user achievements. It includes a database-backed definition system where achievement conditions are stored as logic strings and evaluated dynamically against user statistics.

## 2. Quick Start

1.  **Define a new achievement**: Add an entry to the `ACHIEVEMENTS` array in `achievements.ts`.
2.  **Seed the database**: Run the seeding function (or standard db seed command).
3.  **Check for unlocks**: Call `checkAchievements` after a game ends.
    ```typescript
    await checkAchievements(userId, { gamesPlayed: 5, gamesWon: 2 });
    ```

## 3. API Reference

### `ACHIEVEMENTS` (Constant)
An array of achievement definitions hardcoded in the application.
*   **Properties**: `name`, `description`, `icon`, `condition`, `points`.

### `seedAchievements()`
Synchronizes the hardcoded `ACHIEVEMENTS` list with the database.
*   **Returns**: `Promise<void>`
*   **Behavior**: Uses `upsert` to create missing achievements or update existing ones by name.

### `checkAchievements(userId: number, stats: Record<string, number>)`
Evaluates whether a user qualifies for any new achievements based on their stats.
*   **Params**:
    *   `userId`: ID of the user to check.
    *   `stats`: A dictionary of statistics (e.g., `{ gamesWon: 5, maxScore: 1200 }`).
*   **Returns**: `Promise<void>` (Side effect: creates `UserAchievement` records).

## 4. Common Patterns

### Evaluating Conditions
The system uses a dynamic evaluation engine. The `condition` string in an achievement (e.g., `'gamesPlayed >= 50'`) is compiled into a function where the `stats` keys become variables.

*   **Definition**: `condition: 'streak >= 3'`
*   **Input**: `checkAchievements(1, { streak: 3 })`
*   **Result**: Unlocked.

### Post-Game Hook
Call this function in the API route that handles the end of a game.

```typescript
// src/app/api/game/[gameCode]/finish/route.ts
const stats = calculateUserStats(user);
await checkAchievements(user.id, stats);
```

## 5. Gotchas

*   **Security Risk (Eval)**: The condition evaluator uses `new Function(...)`. While powerful, it executes code. **NEVER** let user input determine the `condition` string of an achievement. The `stats` values should also be strictly typed numbers from the server, not raw client input.
*   **State Keys**: The keys in the `stats` object PASSED to the function must exactly match the variable names used in the `condition` strings. If an achievement uses `wins` but you pass `gamesWon`, it will fail or error.
*   **Console Logging**: The function logs unlocks to the console (`console.log`), which might clutter production logs.

## 6. Related Modules of Interest
*   **`src/lib/prisma.ts`**: Database access.
*   **Prisma Schema**: `Achievement` and `UserAchievement` models.
