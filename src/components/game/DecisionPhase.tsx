import React, { useState, useEffect } from 'react';
import { Clock, User } from 'lucide-react';
import { CrisisCard } from '@/components/game/CrisisCard';
import { RoundIndicator } from '@/components/game/RoundIndicator';
import { gameService } from '@/services/gameService';
import { GameState } from '@/hooks/useGameState';
import { useGameTimer } from '@/hooks/useGameTimer';
import PageTransition from '@/components/ui/PageTransition';

interface Team {
    id: string;
    name: string;
    color: string;
    budget: number;
}

interface DecisionPhaseProps {
    gameState: GameState;
    playerId: number;
    nickname: string;
    team: Team | null;
    isLeader: boolean;
    votes: Record<number, number>;
    gameCode: string; // Added gameCode prop
}

export const DecisionPhase: React.FC<DecisionPhaseProps> = ({
    gameState,
    playerId,
    nickname,
    team,
    isLeader,
    votes,
    gameCode // Destructure gameCode prop
}) => {
    const { cards, currentCardIndex, teams } = gameState; // Removed gameCode from here
    const { timeLeft, formatTime } = useGameTimer(gameState);

    const [selectedResponse, setSelectedResponse] = useState<number | null>(null);

    const currentCard = cards && cards.length > 0
        ? cards[currentCardIndex % cards.length]
        : null;

    const cardId = currentCard?.id;

    // Check existing response and reset state on card change
    useEffect(() => {
        // Reset local state when card changes
        setSelectedResponse(null);

        if (cardId && playerId) {
            gameService.checkResponse(gameCode, playerId.toString(), cardId)
                .then(data => {
                    if (data.hasResponded) {
                        setSelectedResponse(data.responseId);
                    }
                })
                .catch(console.error);
        }
    }, [gameCode, playerId, cardId]);

    const handleSelectResponse = async (responseId: number) => {
        if (timeLeft === 0 || selectedResponse !== null || !currentCard) return;

        // Optimistic update
        setSelectedResponse(responseId);

        try {
            await gameService.submitResponse(gameCode, playerId.toString(), currentCard.id, responseId);
        } catch (err) {
            console.error('Failed to submit response:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to submit response';
            setSelectedResponse(null); // Revert on failure
            alert(errorMessage); // Simple feedback for now
        }
    };

    if (!currentCard) return <div>Loading card...</div>;

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-gray-200 dark:from-gray-800 to-transparent opacity-50 pointer-events-none"></div>

                <div className="w-full max-w-4xl relative z-10">
                    {/* User Profile / Team Identity */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="flex items-center gap-3 bg-white/80 dark:bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-gray-200 dark:border-white/20 shadow-xl transition-colors">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner border-2 border-gray-100 dark:border-white/30" style={{ backgroundColor: team?.color || '#808080' }}>
                                {isLeader ? '👑' : <User className="text-white" size={20} />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-gray-500 dark:text-white/60 text-[10px] font-black uppercase tracking-widest">{isLeader ? 'Team Leader' : 'Team Member'}</span>
                                <span className="text-gray-900 dark:text-white font-black text-xl leading-none">{nickname}</span>
                            </div>
                            <div className="h-8 w-[2px] bg-gray-300 dark:bg-white/20 mx-2" />
                            <div className="flex flex-col items-end">
                                <span className="font-black text-xl leading-none" style={{ color: team?.color || 'gray' }}>{team?.name || 'Unassigned'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Game Header with Scores */}
                    <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
                        {teams?.map(t => (
                            <div key={t.id} className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${t.id === team?.id ? 'bg-black/5 dark:bg-white/10 ring-2 ring-black/10 dark:ring-white/30 scale-110 shadow-lg' : 'opacity-80'}`}>
                                <div className="text-white font-black text-2xl px-6 py-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] border-2" style={{ backgroundColor: t.color, borderColor: t.color }}>
                                    ${t.budget}
                                </div>
                                <span className="font-bold text-xs mt-1 tracking-widest uppercase" style={{ color: t.color }}>
                                    {t.name}
                                    {t.id === team?.id && <span className="ml-1 text-[8px] italic">(YOURS)</span>}
                                </span>
                            </div>
                        ))}

                        {/* Timer */}
                        <div className="flex flex-col items-center gap-2 mx-4">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300 ${timeLeft <= 10 ? 'bg-red-600 border-red-400 animate-pulse' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600'}`}>
                                <Clock size={20} className={timeLeft <= 10 ? 'text-white' : 'text-gray-400'} />
                                <span className={`font-mono font-black text-xl ${timeLeft <= 10 ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{formatTime(timeLeft)}</span>
                            </div>
                        </div>

                        {/* Round Progress Indicator */}
                        <RoundIndicator
                            currentRound={Math.floor(gameState.currentCardIndex / 3) + 1}
                            currentCardIndex={gameState.currentCardIndex}
                            cardsPerRound={3}
                        />
                    </div>

                    {/* Leader Indicator */}
                    {isLeader && (
                        <div className="mb-6 flex justify-center">
                            <div className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-1 rounded-full font-black text-sm border-2 border-yellow-200 shadow-lg animate-bounce">
                                <span>👑</span>
                                <span>YOU ARE THE LEADER</span>
                            </div>
                        </div>
                    )}

                    {/* Main Card Component */}
                    <div className="flex justify-center">
                        <CrisisCard
                            title={currentCard.title}
                            description={currentCard.description}
                            timeLimit={currentCard.timeLimit}
                            responses={currentCard.responses}
                            categoryName={currentCard.category.name}
                            categoryColor={currentCard.category.color}
                            selectedResponseId={selectedResponse}
                            onSelectResponse={handleSelectResponse}
                            disabled={timeLeft === 0 || selectedResponse !== null}
                            isLeader={isLeader}
                            votes={votes}
                            timeLeft={timeLeft}
                        />
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};
