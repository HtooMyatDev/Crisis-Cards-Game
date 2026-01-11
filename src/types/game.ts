export interface Player {
    id: number;
    gameSessionId: string;
    nickname: string;
    score: number;
    joinedAt: Date | string;
    isConnected: boolean;
    team?: string | null; // Legacy field - deprecated
    teamId?: string | null; // New dynamic team reference
}

export interface Team {
    id: string;
    name: string;
    color: string;
    budget: number;
    baseValue: number;
    order: number;
    lastLeaderElectionRound: number;
    electionStatus?: 'OPEN' | 'RUNOFF' | 'COMPLETED';
    runoffCandidates?: number[];
}

export interface Category {
    id: number;
    name: string;
    description?: string | null;
    color: string;
    status: string;
    cards?: { id: number; title: string }[];
}

export interface GameSessionCategory {
    id: string;
    gameSessionId: string;
    categoryId: number;
    category: Category;
}

export interface User {
    id: number;
    name: string | null;
    email: string;
}

export interface GameSession {
    id: string;
    name: string;
    gameCode: string;
    gameMode: string;
    hostId: number;
    status: 'WAITING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';
    currentCardIndex: number;
    startedAt?: Date | string | null;
    endedAt?: Date | string | null;
    createdAt: Date | string;
    updatedAt: Date | string;
    host?: User;
    categories?: GameSessionCategory[];
    players?: Player[];
    teams?: Team[]; // New dynamic teams
    initialBudget: number;
    initialBaseValue: number;
    leaderTermLength: number;
    gameDurationMinutes: number;
    leaderElectionTimer: number;
    totalRounds?: number;
    cardsPerRound?: number;
}

// Game creation types
export type GameMode = 'Standard' | 'Quick Play' | 'Advanced' | 'Custom';

export interface GameFormData {
    name: string;
    categoryIds: string[];
    gameCode: string;
    autoGenerateCode: boolean;
    gameMode: GameMode;
}

export interface CreatedGame {
    id: string;
    name: string;
    gameCode: string;
}
