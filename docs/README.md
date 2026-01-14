# Developer Documentation

Welcome to the technical documentation for the Crisis Card Game application. This directory contains detailed guides for the essential modules of the system.

## Core Modules

*   **[Game Service](./game-service.md)**
    *   The client-side engine for handling gameplay, moves, and state synchronization. Start here if working on the `live` game pages.

*   **[Rules & Validation](./rules-validation.md)**
    *   Authentication and data integrity schemas. Reference this when building forms or API endpoints.

*   **[Middleware & Auth](./middleware-auth.md)**
    *   Understanding the routing protection, role-based access control, and environment rewrites.

*   **[Realtime Events](./realtime-events.md)**
    *   Guide to the Pusher integration for live game updates.

*   **[Achievements System](./achievements-system.md)**
    *   How the dynamic achievement evaluation engine works.

## Getting Started

1.  Read the **Game Service** docs to understand the core loop.
2.  Check **Rules & Validation** before modifying any forms.
3.  Refer to **Realtime Events** if debugging sync issues.
