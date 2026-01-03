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
            <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#3E3E3C] p-4 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-gray-200/50 dark:from-black/20 to-transparent pointer-events-none"></div>

                <div className="w-full max-w-4xl relative z-10">
                    {/* User Profile / Team Identity */}
                    <div className="flex flex-col items-center mb-10">
                        <div className="flex items-center gap-3 bg-white dark:bg-[#FDFAE5] px-6 py-2.5 rounded-full border-[3px] border-[#333] dark:border-[#FDFAE5] shadow-xl transition-colors">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-inner border-2 border-black/10" style={{ backgroundColor: team?.color || '#808080' }}>
                                {isLeader ? '👑' : <User className="text-white" size={20} />}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[#666] text-[10px] font-black uppercase tracking-widest">{isLeader ? 'Team Leader' : 'Team Member'}</span>
                                <span className="text-[#333] font-serif font-bold text-xl leading-none italic">{nickname}</span>
                            </div>
                            <div className="h-8 w-[2px] bg-[#333]/20 mx-2" />
                            <div className="flex flex-col items-end">
                                <span className="font-black text-xl leading-none uppercase" style={{ color: team?.color || 'gray' }}>{team?.name || 'Unassigned'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Game Header with Scores */}
                    <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
                        {teams?.map(t => (
                            <div key={t.id} className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${t.id === team?.id ? 'scale-110 z-10' : 'opacity-70 scale-95'}`}>
                                <div className={`text-white font-black text-2xl px-6 py-3 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(253,250,229,0.2)] border-[3px] border-[#333]
                                     ${t.id === team?.id ? 'ring-4 ring-white/50 dark:ring-[#3E3E3C]/50' : ''}`}
                                    style={{ backgroundColor: t.color }}>
                                    ${t.budget}
                                </div>
                                <span className="font-bold text-xs mt-2 tracking-widest uppercase text-[#333] dark:text-[#FDFAE5]" >
                                    {t.name}
                                    {t.id === team?.id && <span className="ml-1 text-[9px] font-serif italic opacity-60">(YOURS)</span>}
                                </span>
                            </div>
                        ))}

                        {/* Timer */}
                        <div className="flex flex-col items-center gap-2 mx-4">
                            <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl border-[3px] transition-all duration-300 ${timeLeft <= 10 ? 'bg-red-600 border-red-800 animate-pulse text-white' : 'bg-[#333] border-[#333] dark:bg-[#FDFAE5] dark:border-[#FDFAE5] text-white dark:text-[#333]'}`}>
                                <Clock size={20} strokeWidth={2.5} />
                                <span className="font-mono font-black text-2xl tabular-nums tracking-wider">{formatTime(timeLeft)}</span>
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
                            <div className="flex items-center gap-2 bg-[#EBA937] text-[#333] px-8 py-2 rounded-full font-black text-sm border-[3px] border-[#333] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(253,250,229,1)] animate-bounce uppercase tracking-widest">
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
