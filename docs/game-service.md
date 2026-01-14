# Game Service Documentation

## 1. Overview
The `gameService` module (`src/services/gameService.ts`) is a singleton object that serves as the client-side abstraction layer for the Game API. It handles all network communication related to gameplay, including fetching state, submitting moves, casting votes, and managing player session lifecycle. It transforms raw API responses into typed promises and handles common error cases.

## 2. Quick Start
To use the game service in a component:

1.  **Import the service:**
    ```typescript
    import { gameService } from '@/services/gameService';
    ```

2.  **Call an API method:**
    ```typescript
    try {
        const status = await gameService.fetchGameStatus('ABC123');
        console.log(status);
    } catch (error) {
        console.error('Failed to load game');
    }
    ```

3.  **Handle responses:** All methods return Promises that resolve to JSON data or throw an Error.

## 3. API Reference

### `fetchGameStatus(gameCode: string)`
Retrieves the current state of a game session.
*   **Params**: `gameCode` (string) - The 6-character game identifier.
*   **Returns**: `Promise<any>` - The game state object (teams, players, phase, etc.).

### `validatePlayer(gameCode: string, playerId: string)`
Verifies if a player is valid for the current game.
*   **Params**:
    *   `gameCode`: Game identifier.
    *   `playerId`: The ID stored in local storage/cookie.
*   **Returns**: `Promise<PlayerValidationResult>` - `{ valid: boolean, ... }`.

### `submitResponse(gameCode: string, playerId: string, cardId: number, responseId: number)`
Submits a team's decision for a crisis card.
*   **Params**:
    *   `cardId`: ID of the crisis card.
    *   `responseId`: ID of the selected option.
*   **Returns**: `Promise<any>` - Result of the submission.

### `voteForLeader(gameCode: string, playerId: number, candidateId: number)`
Casts a vote for a team leader.
*   **Params**:
    *   `candidateId`: Player ID of the nominee.
*   **Returns**: `Promise<any>` - Vote confirmation.

### `leaveGame(gameCode: string, playerId: string)`
Notifies the server that a player is leaving.
*   **Params**: `gameCode`, `playerId`.
*   **Returns**: `void`
*   **Note**: Attempts to use `navigator.sendBeacon` for reliability during page unload events.

### `fetchVotes(gameCode: string, playerId: string, cardId: number)`
Gets the current voting status (for leader/decision phases).
*   **Params**: `cardId` relates to the decision being voted on.
*   **Returns**: `Promise<object>` - A map or object of votes.

### `fetchResults(gameCode: string)`
Gets the final game results after the game ends.
*   **Returns**: `Promise<any>` - Final scores and outcomes.

## 4. Common Patterns

### Polling for Game State
Used in `GameView` or hooks to keep the UI in sync.

```typescript
useEffect(() => {
    const interval = setInterval(async () => {
        try {
            const data = await gameService.fetchGameStatus(gameCode);
            setGameState(data);
        } catch (e) {
            // Handle error (e.g., game ended or network fail)
        }
    }, 2000);
    return () => clearInterval(interval);
}, [gameCode]);
```

### Safe Form Submission
Handling errors when a user submits an action.

```typescript
const handleVote = async (candidateId: number) => {
    try {
        await gameService.voteForLeader(code, currentPlayer.id, candidateId);
        toast.success('Vote Cast!');
    } catch (err: any) {
        toast.error(err.message || 'Voting failed');
    }
};
```

## 5. Gotchas

*   **`leaveGame` is Fire-and-Forget**: This method does not return a promise you can wait on because it prioritizes `sendBeacon` for reliability when the tab is closing. Do not `await` it if expecting a response.
*   **Error Handling**: The service automatically throws an `Error` if the fetch response is `!ok`. You must wrap calls in `try/catch`.
*   **Type Safety**: Many return types are currently `any` (inferred from `res.json()`). You should cast the results to specific interfaces (e.g., `GameSession`, `VoteResult`) in your consuming code for safety.

## 6. Related Modules of Interest
*   **`src/app/api/game/[gameCode]`**: The backend endpoints this service talks to.
*   **`src/hooks/useGame.ts`** (Hypothetical): Custom hook often used to wrap this service.
*   **`src/lib/pusher-client.ts`**: For real-time updates that might supersede polling.
