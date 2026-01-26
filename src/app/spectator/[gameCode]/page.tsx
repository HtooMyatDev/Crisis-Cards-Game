"use client"
import React from 'react';
import { useParams } from 'next/navigation';
import { Loader2, Clock, MapPin } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import { CrisisCard } from '@/components/game/CrisisCard';
import { RoundIndicator } from '@/components/game/RoundIndicator';
import PageTransition from '@/components/ui/PageTransition';
import { useGameTimer } from '@/hooks/useGameTimer';
import { ResultsModal } from '@/components/game/ResultsModal';

const SpectatorPage = () => {
    const params = useParams();
    const gameCode = params.gameCode as string;

    // Use existing hook - passing null for playerId as spectators are not players
    const {
        gameState
    } = useGameState(gameCode, null);

    const { timeLeft, formatTime } = useGameTimer(gameState);

    if (!gameState) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <Loader2 className="animate-spin text-black dark:text-white" size={48} />
            </div>
        );
    }

    // Determine current view
    const isWaiting = gameState.status === 'WAITING';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const isCompleted = gameState.status === 'COMPLETED';
    const isElection = gameState.roundStatus === 'LEADER_ELECTION';
    const isResults = gameState.roundStatus === 'RESULTS_PHASE';

    const currentCard = gameState.cards && gameState.cards.length > 0
        ? gameState.cards[gameState.currentCardIndex % gameState.cards.length]
        : null;

    return (
        <PageTransition>
            <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#3E3E3C] p-4 flex flex-col items-center relative overflow-hidden transition-colors duration-300 font-sans">

                {/* Header / Status Bar */}
                <div className="w-full max-w-6xl mx-auto flex items-center justify-between py-6 mb-8 relative z-20">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#333] dark:bg-[#FDFBF7] text-white dark:text-[#333] px-4 py-1.5 rounded-full font-black uppercase tracking-widest text-xs flex items-center gap-2">
                            <MapPin size={14} /> SPECTATOR MODE
                        </div>
                        <h1 className="text-2xl font-serif italic font-bold text-[#333] dark:text-[#FDFBF7]">
                            Game: {gameCode}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Timer */}
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all duration-300
                            ${timeLeft <= 10 && !isWaiting ? 'bg-red-600 border-red-800 text-white animate-pulse' : 'bg-white dark:bg-[#333] border-[#333] dark:border-[#FDFBF7] text-[#333] dark:text-[#FDFBF7]'}`}>
                            <Clock size={18} strokeWidth={2.5} />
                            <span className="font-mono font-black text-xl tabular-nums tracking-wider">
                                {isWaiting ? '--:--' : formatTime(timeLeft)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* waiting state */}
                {isWaiting && (
                    <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl px-4">
                        <Loader2 className="animate-spin text-[#333] dark:text-[#FDFBF7] mb-6" size={64} />
                        <h2 className="text-4xl md:text-6xl font-serif italic text-[#333] dark:text-[#FDFBF7] mb-4">Waiting for Host...</h2>
                        <p className="text-xl text-[#666] dark:text-[#FDFBF7]/70">
                            The game will begin shortly. {gameState.players?.length || 0} players joined.
                        </p>
                    </div>
                )}

                {/* Main Game Content */}
                {!isWaiting && (
                    <div className="w-full max-w-6xl flex flex-col items-center gap-8 relative z-10">

                        {/* Team stats row */}
                        <div className="flex flex-wrap justify-center gap-6 w-full">
                            {gameState.teams?.map(t => (
                                <div key={t.id} className="flex flex-col items-center group relative">
                                    <div className="absolute -inset-2 bg-white/50 dark:bg-black/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <div className="relative text-white font-black text-3xl px-8 py-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(253,250,229,0.2)] border-[3px] border-[#333] min-w-[120px] text-center"
                                        style={{ backgroundColor: t.color }}>
                                        ${t.budget}
                                        <div className="absolute -top-3 -right-3 bg-white text-black text-xs font-bold w-8 h-8 flex items-center justify-center rounded-full border-2 border-black shadow-sm">
                                            {t.baseValue}
                                        </div>
                                    </div>
                                    <span className="font-bold text-sm mt-3 tracking-widest uppercase text-[#333] dark:text-[#FDFBF7]">
                                        {t.name}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Phase Display */}
                        {isElection && (
                            <div className="my-12 text-center">
                                <h2 className="text-5xl font-serif italic text-[#333] dark:text-[#FDFBF7] mb-2">Election Phase</h2>
                                <p className="text-[#666] dark:text-[#FDFBF7]/70 text-xl">Teams are choosing their leaders...</p>
                            </div>
                        )}

                        {/* Card Display (Decision or Results context) */}
                        {!isElection && currentCard && (
                            <div className="w-full max-w-4xl opacity-90 pointer-events-none scale-90 md:scale-100 origin-top">
                                <CrisisCard
                                    title={currentCard.title}
                                    description={currentCard.description}
                                    timeLimit={currentCard.timeLimit}
                                    responses={currentCard.responses}
                                    categoryName={currentCard.category.name}
                                    categoryColor={currentCard.category.color}
                                    selectedResponseId={null}
                                    onSelectResponse={async () => { }}
                                    disabled={true}
                                    isLeader={false}
                                    votes={{}} // Spectators don't vote
                                    timeLeft={timeLeft}
                                />
                            </div>
                        )}

                        {/* Round Indicator */}
                        <div className="mt-8">
                            <RoundIndicator
                                currentRound={Math.floor(gameState.currentCardIndex / 3) + 1}
                                currentCardIndex={gameState.currentCardIndex}
                                cardsPerRound={3}
                            />
                        </div>
                    </div>
                )}

                {/* Results Modal for Spectator */}
                {isResults && gameState.lastTurnResult && (
                    <ResultsModal
                        isOpen={true}
                        onClose={async () => { }} // No-op for spectator
                        teamScoreChanges={gameState.lastTurnResult.teamScoreChanges}
                        selectedResponse={undefined} // Show all teams
                        selectedResponseEffects={undefined}
                        impactText={undefined}
                    // Spectators might just see the modal until host advances
                    />
                )}
            </div>
        </PageTransition>
    );
};

export default SpectatorPage;
