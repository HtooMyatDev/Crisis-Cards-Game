// Game code generation and validation utilities

const GAME_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const DEFAULT_CODE_LENGTH = 6;

/**
 * Generates a random game code
 * @param length - Length of the code (default: 6)
 * @returns A random game code string
 */
export function generateGameCode(length: number = DEFAULT_CODE_LENGTH): string {
    let code = '';
    for (let i = 0; i < length; i++) {
        code += GAME_CODE_CHARS.charAt(Math.floor(Math.random() * GAME_CODE_CHARS.length));
    }
    return code;
}

/**
 * Validates a game code format
 * @param code - The game code to validate
 * @returns True if valid, false otherwise
 */
export function validateGameCode(code: string): boolean {
    if (!code || code.length !== DEFAULT_CODE_LENGTH) {
        return false;
    }

    // Check if all characters are valid
    return code.split('').every(char => GAME_CODE_CHARS.includes(char));
}

/**
 * Formats a game code for display (adds dashes)
 * @param code - The game code to format
 * @returns Formatted game code (e.g., "ABC-123")
 */
export function formatGameCode(code: string): string {
    if (code.length === 6) {
        return `${code.slice(0, 3)}-${code.slice(3)}`;
    }
    return code;
}
