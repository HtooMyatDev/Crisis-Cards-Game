import React from 'react';
import { Clock, DollarSign, Heart, Landmark, Settings } from 'lucide-react';

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
    categoryColor,
}) => {
    // Exact palette extraction with Darker Accents for tabs/letters
    const getCategoryPalette = (cat?: string) => {
        const c = cat?.toLowerCase() || '';

        // Green #399B2C -> Darker #266E1E
        if (c.includes('environment')) return { bg: '#399B2C', accent: '#266E1E', text: '#FDFBF7' };

        // Yellow #D9AD1F -> Darker #AB8818
        if (c.includes('economic')) return { bg: '#D9AD1F', accent: '#AB8818', text: '#FDFBF7' };

        // Orange #BE8111 -> Darker #8C5E0C
        if (c.includes('infrastructure')) return { bg: '#BE8111', accent: '#8C5E0C', text: '#FDFBF7' };

        // Blue #4190A9 -> Darker #306B7D
        if (c.includes('society') || c.includes('social')) return { bg: '#4190A9', accent: '#306B7D', text: '#FDFBF7' };

        // Red #CD302F -> Darker #942221
        if (c.includes('political')) return { bg: '#CD302F', accent: '#942221', text: '#FDFBF7' };

        // Default to Green
        return { bg: categoryColor || '#399B2C', accent: '#266E1E', text: '#FDFBF7' };
    };

    const palette = getCategoryPalette(categoryName);

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
            {/* Top Decoration: Larger Tab with Overlapping Dots */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#FDFBF7] px-8 py-5 rounded-b-[2rem] shadow-sm flex items-center justify-center -space-x-3 z-20">
                <div className="w-6 h-6 rounded-full bg-[#399B2C] border-2 border-[#FDFBF7]" />
                <div className="w-6 h-6 rounded-full bg-[#D9AD1F] border-2 border-[#FDFBF7]" />
                <div className="w-6 h-6 rounded-full bg-[#4190A9] border-2 border-[#FDFBF7]" />
                <div className="w-6 h-6 rounded-full bg-[#BE8111] border-2 border-[#FDFBF7]" />
                <div className="w-6 h-6 rounded-full bg-[#CD302F] border-2 border-[#FDFBF7]" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col items-center mt-12">

                {/* Title & Description */}
                <div className="text-center mb-8 px-4 space-y-2">
                    <h2 className="font-serif italic text-4xl sm:text-[3.5rem] text-[#1a1a1a]/90 leading-[1] drop-shadow-sm tracking-tight scale-y-90">
                        {title}
                    </h2>
                    <p className="font-sans text-[#1a1a1a]/80 text-sm sm:text-base font-medium leading-relaxed max-w-sm mx-auto">
                        {description}
                    </p>
                </div>

                {/* Headers: Response Options & Timer */}
                <div className="w-full flex justify-between items-end px-2 mb-2">
                    <h3 className="font-serif italic text-2xl text-[#1a1a1a]/80">
                        Response Options
                    </h3>
                    <div className="font-serif italic text-2xl text-[#1a1a1a]/80">
                        {timeLimit ?? 3} Mins
                    </div>
                </div>

                {/* Responses List */}
                <div className="w-full space-y-9 mt-4" role="radiogroup">
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
                                {/* Cost Badge - Tab Style Above Button */}
                                {(response.cost !== undefined) && (
                                    <div
                                        className="absolute -top-7 right-0 h-8 px-5 flex items-center justify-center rounded-t-xl font-black text-sm text-white z-0"
                                        style={{ backgroundColor: palette.accent }}
                                    >
                                        {response.cost > 0 ? `+${response.cost}` : `${response.cost}`}
                                    </div>
                                )}

                                <button
                                    onClick={() => !disabled && onSelectResponse(response.id)}
                                    disabled={disabled}
                                    className={`
                                        w-full flex items-stretch bg-[#FDFBF7] rounded-xl overflow-hidden transition-all duration-200 shadow-sm relative z-10
                                        ${isSelected ? 'ring-4 ring-white scale-[1.01] shadow-xl' : 'hover:scale-[1.005] hover:shadow-md'}
                                        ${disabled && !isSelected ? 'opacity-60' : 'cursor-pointer'}
                                    `}
                                >
                                    {/* Letter Block - Full Height Left Panel */}
                                    <div
                                        className="w-16 flex flex-col items-center justify-center shrink-0"
                                        style={{ backgroundColor: palette.accent }}
                                    >
                                        <span className="font-serif italic text-4xl text-white font-bold drop-shadow-sm">
                                            {letter}
                                        </span>
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1 py-4 px-6 flex items-center min-h-[5.5rem]">
                                        <p className="text-[#1a1a1a] text-sm sm:text-base font-medium text-left leading-tight">
                                            {response.text}
                                        </p>
                                    </div>
                                </button>

                                {/* Stats Row */}
                                <div className="flex items-center gap-4 px-2 mt-2 ml-1">
                                    {stats.map((stat, i) => (
                                        <div key={i} className="flex items-center justify-center text-[#1a1a1a]/80 font-black text-xs gap-1.5" title="Stat Impact">
                                            <div className="opacity-75">{stat.icon}</div>
                                            <span>{(stat.val ?? 0) > 0 ? '+' : ''}{stat.val}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Vote Count Overlay */}
                                {voteCount > 0 && (
                                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 bg-blue-600 text-white rounded-full w-10 h-10 flex items-center justify-center text-lg font-bold border-4 border-white shadow-xl z-30 animate-in zoom-in">
                                        {voteCount}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>

                {/* Category Footer */}
                <div className="mt-12 mb-2 opacity-60">
                    <h3 className="font-serif text-[#1a1a1a] text-xl tracking-wider text-center italic capitalize">
                        {categoryName?.toLowerCase() || 'Crisis Event'}
                    </h3>
                </div>
            </div>
        </div>
    );
};
