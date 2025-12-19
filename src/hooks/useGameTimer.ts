import { useState, useEffect, useRef } from 'react';
import { GameState } from './useGameState';
import { gameService } from '@/services/gameService';

export const useGameTimer = (gameState: GameState | null) => {
    const [timeLeft, setTimeLeft] = useState<number>(30);
    const lastCardIndexRef = useRef<number>(-1);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Sync timer with server start time
    useEffect(() => {
        if (gameState?.lastCardStartedAt && gameState?.cards && gameState.cards.length > 0) {
            const currentCard = gameState.cards[gameState.currentCardIndex % gameState.cards.length];
            if (currentCard) {
                const startTime = new Date(gameState.lastCardStartedAt).getTime();
                const now = new Date().getTime();
                const timeLimitSeconds = (currentCard.timeLimit || 5) * 60;
                const elapsedSeconds = Math.floor((now - startTime) / 1000);
                const remaining = Math.max(0, timeLimitSeconds - elapsedSeconds);

                setTimeLeft(remaining);

                // Detect new card
                if (gameState.currentCardIndex !== lastCardIndexRef.current) {
                    lastCardIndexRef.current = gameState.currentCardIndex;
                }
            }
        }
    }, [gameState?.currentCardIndex, gameState?.cards, gameState?.lastCardStartedAt]);

    // Countdown interval
    useEffect(() => {
        if (gameState?.status === 'IN_PROGRESS') {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        // Auto-advance logic
                        if (prev === 1) {
                            gameService.advanceGame(gameState.gameCode).catch(() => {});
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => {
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }
    }, [gameState?.status, gameState?.gameCode]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return { timeLeft, formatTime };
};
