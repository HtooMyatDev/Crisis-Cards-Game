# Rules & Validation Documentation

## 1. Overview
The rules module (`src/lib/rules.ts`) serves as the central source specifically for input validation and data schemas. It uses `zod` to define strict shapes for critical data structures like login forms, registration, and game session creation. This ensures that invalid data is caught before it reaches the API or database.

## 2. Quick Start
To validate data against a schema:

1.  **Import the schema:**
    ```typescript
    import { loginFormSchema } from '@/lib/rules';
    ```

2.  **Parse data (e.g., in an API route or form handler):**
    ```typescript
    try {
        const validData = loginFormSchema.parse(requestBody);
        // Use validData...
    } catch (error) {
        // Handle validation error (ZodError)
        return new Response('Invalid Input', { status: 400 });
    }
    ```

## 3. API Reference

### `loginFormSchema`
Validates user login credentials.
*   **Fields**:
    *   `email`: Email string (trimmed, lowercased).
    *   `password`: Minimum 5 chars, max 100.

### `registerFormSchema`
Validates new user registration.
*   **Fields**:
    *   `name`: 5-20 characters.
    *   `email`: Valid email.
    *   `password`: 5-100 characters.
    *   `confirmPassword`: Must match `password`.
*   **Refinements**: Checks `confirmPassword === password`.

### `gameCreateSchema`
Validates joining a game.
*   **Fields**:
    *   `gameCode`: Minimum 6 chars string.

### `gameSessionSchema`
Validates the creation of a new game session (Admin).
*   **Fields**:
    *   `name`: 3-100 chars.
    *   `gameCode`: Exactly 6 alphanumeric characters (A-Z, 0-9).
    *   `gameMode`: Enum ('Standard', 'Quick Play', 'Advanced', 'Custom').
    *   `categoryIds`: Array of positive numbers (1-10 items).
    *   `shuffledCardIds`: Optional array of numbers.

## 4. Common Patterns

### React Hook Form Integration
This module is designed to work seamlessly with `react-hook-form` and `@hookform/resolvers/zod`.

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerFormSchema } from '@/lib/rules';

const form = useForm({
    resolver: zodResolver(registerFormSchema),
});
```

### API Request Validation
Ensuring backend reliability.

```typescript
export async function POST(req: Request) {
    const body = await req.json();
    const result = gameSessionSchema.safeParse(body);

    if (!result.success) {
        return NextResponse.json({ errors: result.error.flatten() }, { status: 400 });
    }
    // Proceed with result.data
}
```

## 5. Gotchas

*   **`confirmPassword`**: The `registerFormSchema` uses `.superRefine` to check password equality. This logic only runs after individual field validation passes.
*   **Transformations**: Note that `email` fields automatically apply `.trim()` and `.toLowerCase()`. The output of `.parse()` might differ from the input string (which is good, but be aware).
*   **Regex Limitations**: `gameCode` enforces `^[A-Z0-9]+$`. Lowercase letters will fail validation even if the length is correct.

## 6. Related Modules of Interest
*   **`zod`**: The underlying validation library.
*   **`react-hook-form`**: Commonly used frontend library that consumes these schemas.
