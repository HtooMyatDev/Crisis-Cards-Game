import React from 'react';
import { Clock, DollarSign, Heart, Settings, Landmark, Keyboard } from 'lucide-react';

interface CardResponse {
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

interface CrisisCardProps {
    title: string;
    description: string;
    timeLimit: number | null;
    responses: CardResponse[];
    selectedResponseId: number | null;
    onSelectResponse: (id: number) => void;
    disabled: boolean;
    isLeader: boolean;
    votes?: Record<number, number>;
    timeLeft: number;
    categoryName?: string;
    categoryColor?: string;
}

export const CrisisCard: React.FC<CrisisCardProps> = ({
    title,
    description,
    timeLimit,
    responses,
    selectedResponseId,
    onSelectResponse,
    disabled,
    isLeader,
    votes = {},
    timeLeft,
    categoryName,
    categoryColor = '#2D9C3C', // Default to the green from the sample
}) => {
    // Keyboard navigation handler
    const handleKeyDown = (e: React.KeyboardEvent, responseId: number) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) {
                onSelectResponse(responseId);
            }
        }
    };

    // Add global keyboard shortcuts
    React.useEffect(() => {
        const handleGlobalKeyPress = (e: KeyboardEvent) => {
            if (disabled) return;
            const key = e.key.toUpperCase();
            const index = key.charCodeAt(0) - 65; // A=0, B=1, C=2, etc.
            if (index >= 0 && index < responses.length) {
                e.preventDefault();
                onSelectResponse(responses[index].id);
            }
        };
        window.addEventListener('keydown', handleGlobalKeyPress);
        return () => window.removeEventListener('keydown', handleGlobalKeyPress);
    }, [disabled, responses, onSelectResponse]);

    const isTimeCritical = timeLeft <= 10 && timeLeft > 0;

    return (
        <div
            className={`relative w-full max-w-2xl mx-auto rounded-3xl sm:rounded-[3rem] p-4 sm:p-8 md:p-12 shadow-2xl transition-all duration-500 overflow-hidden ${isTimeCritical ? 'animate-pulse ring-8 ring-red-500/50' : ''}`}
            style={{ backgroundColor: categoryColor }}
        >
            {/* Top Header Circles Area */}
            <div className="flex justify-center mb-12">
                <div className="bg-[#FBFAF3] px-10 py-4 rounded-b-[2rem] -mt-12 flex gap-3 shadow-md">
                    <div className="w-5 h-5 rounded-full bg-[#4CAF50]" />
                    <div className="w-5 h-5 rounded-full bg-[#FFB300]" />
                    <div className="w-5 h-5 rounded-full bg-[#2196F3]" />
                    <div className="w-5 h-5 rounded-full bg-[#00BCD4]" />
                    <div className="w-5 h-5 rounded-full bg-[#F44336]" />
                </div>
            </div>

            {/* Title & Description */}
            <div className="text-center mb-6 sm:mb-12">
                <h2 className="font-[family-name:var(--font-russo)] text-3xl sm:text-5xl text-white mb-4 tracking-tight leading-tight uppercase drop-shadow-md">
                    {title}
                </h2>
                <p className="font-[family-name:var(--font-roboto)] text-white/90 text-lg sm:text-xl md:text-2xl font-medium leading-relaxed max-w-lg mx-auto drop-shadow-sm">
                    {description}
                </p>
            </div>

            {/* Header Info Row */}
            <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-8 px-4 gap-4">
                <div className="flex flex-col items-center md:items-start">
                    <h3 className="font-[family-name:var(--font-russo)] text-white text-xl sm:text-3xl leading-none uppercase tracking-wide drop-shadow-md">
                        {isLeader ? 'Final Decision' : 'Cast Your Vote'}
                    </h3>
                    <p className="text-white/70 text-xs font-black uppercase tracking-[0.2em] mt-2 font-[family-name:var(--font-roboto)] drop-shadow-sm">
                        {isLeader ? 'Your choice affects the whole team' : 'Help your leader choose'}
                    </p>
                </div>

                <div className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl border border-white/20 backdrop-blur-sm">
                    <Clock size={16} className="text-white" />
                    <span className="font-[family-name:var(--font-russo)] text-white text-xl leading-none uppercase shadow-black/10">
                        {timeLimit || 5} Mins
                    </span>
                </div>
            </div>

            {/* Response Options */}
            <div className="space-y-4 font-[family-name:var(--font-roboto)]" role="radiogroup" aria-label="Response options">
                {responses.map((response, idx) => {
                    const isSelected = selectedResponseId === response.id;
                    const letter = String.fromCharCode(65 + idx);
                    const voteCount = votes[response.id] || 0;

                    // Stat list for the response
                    const stats = [
                        { icon: <Clock size={14} />, val: response.politicalEffect, color: 'text-white' },
                        { icon: <DollarSign size={14} />, val: response.economicEffect, color: 'text-white' },
                        { icon: <Heart size={14} />, val: response.societyEffect, color: 'text-white' },
                        { icon: <Settings size={14} />, val: response.infrastructureEffect, color: 'text-white' },
                        { icon: <Landmark size={14} />, val: response.environmentEffect, color: 'text-white' },
                    ];

                    return (
                        <div key={response.id} className="relative group">
                            {/* Score/Cost Badge */}
                            {(response.cost !== undefined || response.score !== undefined) && (
                                <div className="absolute -top-3 right-6 z-10 pointer-events-none">
                                    <div className="bg-[#79C991] text-[#1A4D2E] px-3 py-0.5 rounded-md font-black text-xs shadow-sm border border-[#1A4D2E]/10 font-mono">
                                        {response.cost ? (response.cost > 0 ? `-${response.cost}` : `+${Math.abs(response.cost)}`) : (response.score && response.score > 0 ? `+${response.score}` : response.score)}
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={() => !disabled && onSelectResponse(response.id)}
                                onKeyDown={(e) => handleKeyDown(e, response.id)}
                                disabled={disabled}
                                className={`
                                    w-full relative rounded-2xl transition-all duration-300 text-left overflow-hidden border-2
                                    ${isSelected
                                        ? 'bg-white shadow-xl'
                                        : 'bg-[#FBFAF3] hover:bg-white border-transparent shadow-md hover:shadow-lg'
                                    }
                                    ${disabled && !isSelected ? 'opacity-60 grayscale-[0.2]' : 'cursor-pointer'}
                                `}
                                style={{
                                    boxShadow: isSelected ? `0 0 0 4px ${categoryColor}` : undefined
                                }}
                            >
                                <div className="flex">
                                    {/* Letter Box */}
                                    <div
                                        className={`
                                        w-16 md:w-20 flex items-center justify-center font-[family-name:var(--font-russo)] text-3xl border-r-2 border-[#1A4D2E]/10
                                        ${isSelected ? 'text-white' : 'text-[#1A4D2E]'}
                                    `}
                                        style={{ backgroundColor: isSelected ? categoryColor : undefined }}
                                    >
                                        {letter}
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-grow p-4 md:p-5">
                                        <p className="text-[#1A4D2E] font-medium text-lg leading-snug">
                                            {response.text}
                                        </p>
                                    </div>
                                </div>

                                {/* Selection Glow */}
                                {isSelected && (
                                    <div
                                        className="absolute inset-0 pointer-events-none"
                                        style={{ backgroundColor: categoryColor, opacity: 0.1 }}
                                    />
                                )}

                                {/* Leader View: Vote Badge */}
                                {isLeader && voteCount > 0 && (
                                    <div className="absolute top-2 right-2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-black text-sm shadow-lg border-2 border-white animate-bounce z-20">
                                        {voteCount}
                                    </div>
                                )}
                            </button>

                            {/* Stat Icons Row (Below the box) */}
                            <div className="mt-1 flex gap-4 px-6 overflow-x-auto no-scrollbar h-6 items-center">
                                {stats.map((stat, i) => (
                                    <div key={i} className="flex items-center gap-1 opacity-80" title="Effect">
                                        <div className="bg-black/20 p-1 rounded-full text-white">
                                            {stat.icon}
                                        </div>
                                        <span className="text-white font-bold text-[10px] font-mono">
                                            {stat.val && stat.val > 0 ? '+' : ''}{stat.val || 0}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Footer Category */}
            <div className="mt-8 text-center">
                <p className="font-[family-name:var(--font-russo)] text-white/60 text-2xl opacity-50 uppercase tracking-widest">
                    {categoryName || 'Crisis'}
                </p>
            </div>

            {/* Keyboard Hint */}
            <div className="absolute bottom-4 right-8 text-white/30 text-[10px] font-bold uppercase tracking-widest pointer-events-none font-mono">
                Keys A-{String.fromCharCode(64 + responses.length)}
            </div>
        </div>
    );
};
