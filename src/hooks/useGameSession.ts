import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gameService } from '@/services/gameService';

export const useGameSession = (gameCode: string) => {
    const router = useRouter();
    const [nickname, setNickname] = useState('');
    const [playerId, setPlayerId] = useState<number | null>(null);
    const [isLeader, setIsLeader] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeSession = async () => {
            const storedNickname = localStorage.getItem('currentNickname');
            const storedPlayerId = localStorage.getItem('currentPlayerId');

            if (!storedNickname || !storedPlayerId) {
                router.push('/live');
                return;
            }

            // Sync with server
            const result = await gameService.validatePlayer(gameCode, storedPlayerId);

            if (!result.valid) {
                localStorage.removeItem('currentPlayerId');
                localStorage.removeItem('currentNickname');
                router.push(`/live?code=${gameCode}&error=session_expired`);
                return;
            }

            // Auto-correct nickname
            if (result.nickname && result.nickname !== storedNickname) {
                localStorage.setItem('currentNickname', result.nickname);
                setNickname(result.nickname);
            } else {
                setNickname(storedNickname);
            }

            setPlayerId(parseInt(storedPlayerId));
            setIsLeader(result.isLeader || false);
            setLoading(false);
        };

        initializeSession();
    }, [gameCode, router]);

    useEffect(() => {
        const handleUnload = () => {
            if (playerId) {
                gameService.leaveGame(gameCode, playerId.toString());
            }
        }

        window.addEventListener('beforeunload', handleUnload);

        return () => {
            window.removeEventListener('beforeunload', handleUnload);
        }
    }, [playerId, gameCode]);
    
    const leaveGame = async () => {
        if (playerId) {
            await gameService.leaveGame(gameCode, playerId.toString());
        }
        localStorage.removeItem('currentPlayerId');
        localStorage.removeItem('currentNickname');
        router.push('/live');
    };

    return {
        nickname,
        playerId,
        isLeader,
        setIsLeader, // Allow updating from polling data
        loading,
        leaveGame
    };
};
