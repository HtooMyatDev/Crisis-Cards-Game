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

    // OPTIONAL: Auto-select random option on timeout (if leader)
    useEffect(() => {
        if (timeLeft === 0 && isLeader && selectedResponse === null && currentCard && currentCard.responses.length > 0) {
            const randomResponse = currentCard.responses[Math.floor(Math.random() * currentCard.responses.length)];
            console.log("Time's up! Auto-selecting response:", randomResponse.id);
            handleSelectResponse(randomResponse.id);
        }
    }, [timeLeft, isLeader, selectedResponse, currentCard]);

    const handleSelectResponse = async (responseId: number) => {
        if (selectedResponse !== null || !currentCard) return;

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
            <div className="min-h-screen bg-[#FDFAE5] dark:bg-[#3E3E3C] p-4 flex flex-col items-center justify-center relative overflow-hidden transition-colors duration-300">
                {/* Background - Light Mode */}
                <img
                    src="/svg/light/background.svg"
                    alt=""
                    className="absolute inset-x-0 top-0 w-full h-[110vh] object-cover pointer-events-none dark:hidden z-0"
                    aria-hidden="true"
                />
                {/* Background - Dark Mode */}
                <img
                    src="/svg/dark/background.svg"
                    alt=""
                    className="absolute inset-x-0 top-0 w-full h-[110vh] object-cover pointer-events-none hidden dark:block z-0"
                    aria-hidden="true"
                />

                <div className="w-full max-w-4xl relative z-10 px-2 sm:px-0">
                    {/* User Profile / Team Identity */}
                    <div className="flex flex-col items-center mb-6 sm:mb-10 w-full">
                        <div className="flex items-center gap-2 sm:gap-3 bg-white/90 dark:bg-stone-800/90 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-2.5 rounded-full border-[2px] border-black/10 shadow-lg transition-colors max-w-full overflow-hidden">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex shrink-0 items-center justify-center text-lg sm:text-xl shadow-md border-2 border-white/20" style={{ backgroundColor: team?.color || '#808080' }}>
                                {isLeader ? '👑' : <User className="text-white w-4 h-4 sm:w-5 sm:h-5" />}
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-[#666] dark:text-stone-400 text-[8px] sm:text-[10px] font-black uppercase tracking-widest whitespace-nowrap">
                                    {isLeader ? 'Leader' : 'Member'}
                                </span>
                                <span className="text-[#333] dark:text-yellow-50 font-serif font-bold text-base sm:text-xl leading-none italic truncate max-w-[80px] sm:max-w-[150px]">
                                    {nickname}
                                </span>
                            </div>
                            <div className="h-6 sm:h-8 w-[1px] bg-black/10 dark:bg-white/10 mx-1 sm:mx-2 shrink-0" />
                            <div className="flex flex-col items-end min-w-0 shrink">
                                <span className="font-black text-sm sm:text-xl leading-none uppercase truncate max-w-[70px] sm:max-w-none" style={{ color: team?.color || 'gray' }}>
                                    {team?.name || 'Unassigned'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Game Header with Scores */}
                    <div className="flex justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 flex-wrap">
                        {teams?.map(t => (
                            <div key={t.id} className={`flex flex-col items-center p-1 sm:p-2 rounded-xl transition-all duration-300 ${t.id === team?.id ? 'scale-105 sm:scale-110 z-10' : 'opacity-80 scale-90 sm:scale-95'}`}>
                                <div className={`relative px-4 sm:px-6 py-2 sm:py-3 rounded-[12px] sm:rounded-xl shadow-lg border border-white/20
                                     ${t.id === team?.id ? 'ring-2 ring-white/30' : ''}`}
                                    style={{ backgroundColor: t.color }}>
                                    <div className="absolute inset-[3px] rounded-[9px] border border-white/10 pointer-events-none"></div>
                                    <span className="relative z-10 text-white font-black text-lg sm:text-2xl tabular-nums">
                                        ${t.budget}
                                    </span>
                                </div>
                                <span className="font-bold text-[10px] sm:text-xs mt-1 sm:mt-2 tracking-widest uppercase text-[#333] dark:text-[#FDFBF7] text-center" >
                                    {t.name}
                                    {t.id === team?.id && <span className="ml-1 text-[8px] sm:text-[9px] font-serif italic opacity-60 block sm:inline">(YOURS)</span>}
                                </span>
                            </div>
                        ))}

                        <div className="w-full h-0 sm:hidden" /> {/* Force break on mobile for the timer/round indicator */}

                        {/* Timer */}
                        <div className="flex flex-col items-center gap-2 mx-2 sm:mx-4 mt-2 sm:mt-0 order-last sm:order-none">
                            <div className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl border-[2px] sm:border-[3px] transition-all duration-300 ${timeLeft <= 10 ? 'bg-red-600 border-red-800 animate-pulse text-white' : 'bg-[#333] border-[#333] dark:bg-[#FDFBF7] dark:border-[#FDFBF7] text-white dark:text-[#333]'}`}>
                                <Clock className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                                <span className="font-mono font-black text-xl sm:text-2xl tabular-nums tracking-wider">{formatTime(timeLeft)}</span>
                            </div>
                        </div>

                        {/* Round Progress Indicator */}
                        <div className="mt-2 sm:mt-0 flex items-center scale-90 sm:scale-100 transform origin-left">
                            <RoundIndicator
                                currentRound={Math.floor(gameState.currentCardIndex / 3) + 1}
                                currentCardIndex={gameState.currentCardIndex}
                                cardsPerRound={3}
                            />
                        </div>
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
                            disabled={selectedResponse !== null}
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
