# Realtime Events (Pusher) Documentation

## 1. Overview
The application uses **Pusher Channels** to facilitate real-time communication between the server and connected clients (players and admins). This enables features like live leaderboards, instant phase transitions, and synchronized voting results without requiring manual page refreshes.

## 2. Quick Start

### Server-Side (Triggering Events)
```typescript
import { pusherServer } from '@/lib/pusher';

await pusherServer.trigger('game-code-123', 'player-joined', {
    playerId: 45,
    nickname: 'CrisisManager'
});
```

### Client-Side (Listening for Events)
```typescript
import { pusherClient } from '@/lib/pusher-client';

useEffect(() => {
    const channel = pusherClient.subscribe('game-code-123');

    channel.bind('player-joined', (data) => {
        console.log('New player:', data.nickname);
    });

    return () => {
        pusherClient.unsubscribe('game-code-123');
    };
}, []);
```

## 3. API Reference

### `pusherServer` (`src/lib/pusher.ts`)
The server-side singleton for triggering events.
*   **Method**: `trigger(channel, event, data)`
*   **Config**: Uses `PUSHER_APP_ID`, `KEY`, `SECRET`.

### `pusherClient` (`src/lib/pusher-client.ts`)
The client-side singleton for subscribing to channels.
*   **Method**: `subscribe(channelName)`
*   **Method**: `channel.bind(eventName, callback)`
*   **Config**: Uses `NEXT_PUBLIC_PUSHER_KEY`.

## 4. Common Patterns

### Game State Synchronization
The most common pattern is using the `gameCode` as the unique channel name.

1.  **Phase Change**: Server triggers `phase-change` on channel `GAME_CODE`.
2.  **Vote Cast**: Server triggers `vote-update` on channel `GAME_CODE`.
3.  **Client Reacts**: Client listens to these events and calls `gameService.fetchGameStatus()` to get the authoritative new state (or uses the payload data directly if lightweight).

### Optimizing Re-renders
Combining Pusher with React Query or SWR.

```typescript
channel.bind('update', () => {
    // Invalidate the cache to force a refetch
    queryClient.invalidateQueries(['game', gameCode]);
});
```

## 5. Gotchas

*   **Connection Limits**: Pusher has concurrent connection limits based on the plan. In development, the `pusher.ts` file uses a `globalThis` hack to prevent creating too many instances during hot reloads.
*   **Security**: Currently, public channels are likely used. Anyone with the game code can subscribe. For private data, use Private Channels (requires an auth endpoint).
*   **Ephemeral Data**: Pusher messages are not stored. If a client disconnects and reconnects, they miss messages sent in the interim. Always fetch the full state on load/reconnect.

## 6. Related Modules of Interest
*   **`src/services/gameService.ts`**: Often fetches data after a signal is received.
*   **`src/app/live/[gameCode]/page.tsx`**: The main consumer of these events.
