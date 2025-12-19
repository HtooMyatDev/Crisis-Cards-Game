import { useState, useCallback, useRef } from 'react';
import { useGamePolling } from './useGamePolling';
import { gameService } from '@/services/gameService';
import { GameStatus } from '@prisma/client';

// Define types locally or import (ideally we should have a shared types file, but copying for now to avoid circular deps if types are in components)
// We already saw types in page.tsx, let's extract them later. For now using any or simplified types.
// Actually, let's try to verify if src/types/game.ts exists.

interface Team {
    id: string;
    name: string;
    color: string;
    budget: number;
}

interface Player {
    id: number;
    nickname: string;
    teamId?: string | null;
    score: number;
    isLeader: boolean;
    team?: Team;
}

export interface CardResponse {
    id: number;
    text: string;
    score?: number;
    cost?: number;
    politicalEffect?: number;
    economicEffect?: number;
    infrastructureEffect?: number;
    societyEffect?: number;
    environmentEffect?: number;
}

interface GameCard {
    id: number;
    title: string;
    description: string;
    timeLimit: number | null;
    category: {
        name: string;
        color: string;
    };
    responses: CardResponse[];
}

export interface TeamScoreChange {
    teamId: string;
    teamName: string;
    teamColor: string;
    scoreChange: number;
    selectedResponse?: string;
    impactDescription?: string;
    selectedResponseEffects?: SelectedResponseEffects;
}

export interface SelectedResponseEffects {
    political?: number;
    economic?: number;
    infrastructure?: number;
    society?: number;
    environment?: number;
}

export interface LastTurnResult {
    teamScoreChanges: TeamScoreChange[];
    selectedResponse?: string;
    impactDescription?: string;
    selectedResponseEffects?: SelectedResponseEffects;
}

export interface GameState {
    id: string;
    gameCode: string;
    status: GameStatus; // 'WAITING' | 'IN_PROGRESS' ...
    currentCardIndex: number;
    cards?: GameCard[];
    players?: Player[];
    teams?: Team[];
    lastCardStartedAt?: string | null;
    roundStatus?: 'LEADER_ELECTION' | 'DECISION_PHASE' | 'RESULTS_PHASE';
    lastTurnResult?: LastTurnResult;
}

export const useGameState = (gameCode: string, playerId: number | null) => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [team, setTeam] = useState<Team | null>(null);
    const [votes, setVotes] = useState<Record<number, number>>({});

    // Derived state for the current player's team info
    const isLeaderRef = useRef(false);

    const fetchGameData = useCallback(async () => {
        try {
            const data = await gameService.fetchGameStatus(gameCode);
            setGameState(data);

            if (playerId && data.players) {
                const currentPlayer = data.players.find((p: Player) => p.id === playerId);
                if (currentPlayer) {
                    isLeaderRef.current = currentPlayer.isLeader;

                    // Logic to extract team similar to page.tsx
                    // Prioritize nested team
                    if (currentPlayer.team) {
                        setTeam(currentPlayer.team);
                    } else if (currentPlayer.teamId && data.teams) {
                         const t = data.teams.find((tm: Team) => tm.id === currentPlayer.teamId);
                         setTeam(t || null);
                    } else {
                        setTeam(null);
                    }

                    // Poll votes if leader in decision phase
                    if (currentPlayer.isLeader && data.roundStatus === 'DECISION_PHASE' && data.cards && data.cards.length > 0) {
                        const currentCard = data.cards[data.currentCardIndex % data.cards.length];
                         // Fetch votes separately to avoid massive payload in main poll if needed
                         // but for now keeping it here
                         gameService.fetchVotes(gameCode, playerId.toString(), currentCard.id)
                            .then(setVotes)
                            .catch(console.error);
                    }
                }
            }

            // Check phase transition
            if (data.status === 'IN_PROGRESS' && data.roundStatus === 'DECISION_PHASE' && data.cards) {
                const currentCard = data.cards[data.currentCardIndex % data.cards.length];
                if (currentCard) {
                    gameService.checkPhaseTransition(gameCode, currentCard.id).catch(() => {});
                }
            }

        } catch (error) {
            console.error('Error in useGameState polling:', error);
        }
    }, [gameCode, playerId]);

    useGamePolling({
        interval: 500,
        enabled: true,
        onPoll: fetchGameData
    });

    return {
        gameState,
        team,
        votes,
        isLeader: isLeaderRef.current,
        mutate: fetchGameData
    };
};
