import React from 'react';
import { Clock, DollarSign, Heart, Settings, Landmark, Keyboard } from 'lucide-react';

interface CardResponse {
    id: number;
    text: string;
    score?: number;
    cost?: number;
    politicalEffect?: number; // Clock (Speed/Urgency?)
    economicEffect?: number;  // $
    infrastructureEffect?: number; // Bank/Building
    societyEffect?: number; // Heart
    environmentEffect?: number; // Gear/Environment
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
    categoryColor, // We will override this with our strict palette based on categoryName
}) => {
    // defined palette based on screenshots
    const getCategoryPalette = (cat?: string) => {
        const c = cat?.toLowerCase() || '';
        if (c.includes('political')) return { bg: '#C53030', text: '#FDFBF7' }; // Deep Red
        if (c.includes('environment')) return { bg: '#48BB78', text: '#FDFBF7' }; // Lush Green
        if (c.includes('economic')) return { bg: '#D69E2E', text: '#FDFBF7' }; // Gold
        if (c.includes('society') || c.includes('social')) return { bg: '#4299E1', text: '#FDFBF7' }; // Blue
        if (c.includes('infrastructure')) return { bg: '#DD6B20', text: '#FDFBF7' }; // Orange
        return { bg: categoryColor || '#48BB78', text: '#FDFBF7' };
    };

    const palette = getCategoryPalette(categoryName);
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
            className={`
                relative w-full max-w-xl mx-auto rounded-[2.5rem] p-8 shadow-2xl transition-all duration-500 overflow-hidden text-[#1a1a1a]
                ${isTimeCritical ? 'animate-pulse ring-8 ring-red-500/50' : ''}
                font-sans
            `}
            style={{ backgroundColor: palette.bg }}
        >
            {/* Top Decoration: White pill with colored dots */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#FDFBF7] px-5 py-3 rounded-b-[1.25rem] shadow-sm flex items-center justify-center -space-x-1 z-20">
                <div className="w-5 h-5 rounded-full bg-[#4CAF50] z-0" />
                <div className="w-5 h-5 rounded-full bg-[#EBA937] z-10" />
                <div className="w-5 h-5 rounded-full bg-[#2196F3] z-20" />
                <div className="w-5 h-5 rounded-full bg-[#ED8936] z-30" />
                <div className="w-5 h-5 rounded-full bg-[#F44336] z-40" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center mt-8">

                {/* Title & Description */}
                <div className="text-center mb-10 px-2 space-y-4">
                    <h2 className="font-serif italic text-4xl sm:text-5xl text-[#1a1a1a]/90 tracking-tight leading-[1.1] drop-shadow-sm">
                        {title}
                    </h2>
                    <p className="font-sans text-[#1a1a1a]/70 text-base sm:text-lg font-medium leading-relaxed max-w-md mx-auto">
                        {description}
                    </p>
                </div>

                {/* Headers: Response Options & Timer */}
                <div className="w-full flex justify-between items-end px-1 mb-3">
                    <h3 className="font-serif italic text-2xl text-[#1a1a1a]/80">
                        Response Options
                    </h3>
                    <div className="font-serif italic text-2xl text-[#1a1a1a]/80">
                        {timeLimit ?? 3} Mins
                    </div>
                </div>

                {/* Responses List */}
                <div className="w-full space-y-4" role="radiogroup">
                    {responses.map((response, idx) => {
                        const isSelected = selectedResponseId === response.id;
                        const letter = String.fromCharCode(65 + idx);
                        const voteCount = votes[response.id] || 0;

                        // Stats
                        const stats = [
                            { icon: <DollarSign size={14} strokeWidth={3} />, val: response.economicEffect },
                            { icon: <Heart size={14} strokeWidth={3} />, val: response.societyEffect },
                            { icon: <Clock size={14} strokeWidth={3} />, val: response.politicalEffect },
                            { icon: <Landmark size={14} strokeWidth={3} />, val: response.infrastructureEffect },
                            { icon: <Settings size={14} strokeWidth={3} />, val: response.environmentEffect || response.score },
                        ].filter(s => s.val !== undefined && s.val !== 0);

                        return (
                            <div key={response.id} className="relative group">
                                {/* Cost Badge (Top Right of the card block) */}
                                {/* Cost Badge (Top Right of the card block) */}
                                {(response.cost !== undefined) && (
                                    <div className="absolute -top-6 right-0 z-20">
                                        <span className="font-sans font-black text-xs text-[#1a1a1a]/80 py-0.5 px-1">
                                            {response.cost > 0 ? `+${response.cost}` : `${response.cost}`}
                                        </span>
                                    </div>
                                )}

                                <button
                                    onClick={() => !disabled && onSelectResponse(response.id)}
                                    disabled={disabled}
                                    className={`
                                        w-full flex items-stretch bg-[#FDFBF7] rounded-xl overflow-hidden transition-all duration-200 shadow-md
                                        ${isSelected ? 'ring-4 ring-white scale-[1.02] shadow-xl' : 'hover:scale-[1.01] hover:shadow-lg'}
                                        ${disabled && !isSelected ? 'opacity-60' : 'cursor-pointer'}
                                    `}
                                >
                                    {/* Letter Block - Lush Green */}
                                    {/* Letter Block */}
                                    <div
                                        className="w-14 flex flex-col items-center justify-center border-r-[3px] border-white/20"
                                        style={{ backgroundColor: palette.bg }}
                                    >
                                        <span className="font-serif italic text-2xl text-white font-bold drop-shadow-sm">
                                            {letter}
                                        </span>
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1 p-4 flex items-center min-h-[4.5rem]">
                                        <p className="text-[#1a1a1a] text-sm sm:text-base font-medium text-left leading-tight">
                                            {response.text}
                                        </p>
                                    </div>
                                </button>

                                {/* Stats Row (Below Button) */}
                                <div className="flex items-center gap-3 px-2 mt-1.5 ml-1">
                                    {stats.map((stat, i) => (
                                        <div key={i} className="flex items-center text-[#1a1a1a] font-bold text-xs gap-1 opacity-80 backdrop-blur-sm bg-black/5 px-2 py-0.5 rounded-full">
                                            <div className="text-[#1a1a1a]">
                                                {stat.icon}
                                            </div>
                                            <span>{stat.val && stat.val > 0 ? '+' : ''}{stat.val}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Vote Count Overlay (Visible to everyone) */}
                                {voteCount > 0 && (
                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold border-2 border-white shadow-lg z-30 animate-in zoom-in">
                                        {voteCount}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Category Footer */}
                <div className="mt-10 mb-2">
                    <h3 className="font-serif text-[#1a1a1a]/40 text-lg tracking-widest uppercase text-center font-bold">
                        {categoryName || 'Crisis Event'}
                    </h3>
                </div>
            </div>

        </div>
    );
};
