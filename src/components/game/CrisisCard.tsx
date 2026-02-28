import React from 'react';
import { Clock, DollarSign, Heart, Landmark, Settings, Users, Zap, Shield, TrendingUp, Building2, Leaf } from 'lucide-react';

interface CardResponse {
    id: number;
    text: string;
    score?: number;
    cost?: number; // monetary cost
    politicalEffect?: number; // Clock (Speed/Urgency?) - Red
    economicEffect?: number;  // $ - Yellow
    infrastructureEffect?: number; // Bank/Building - Orange
    societyEffect?: number; // Heart - Blue
    environmentEffect?: number; // Gear/Environment - Green
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
}) => {

    const getTheme = (cat?: string) => {
        const c = cat?.toLowerCase() || '';

        // Green / Environmental
        if (c.includes('environment')) {
            return {
                bg: 'bg-green-600',
                shadow: 'shadow-[-2.75px_3.58px_9.81px_0px_rgba(0,0,0,0.10)] shadow-[-10.91px_14.12px_17.88px_0px_rgba(0,0,0,0.09)] shadow-[-24.57px_31.81px_22.92px_0px_rgba(0,0,0,0.05)] shadow-[-43.63px_56.56px_22.92px_0px_rgba(0,0,0,0.01)]',
                textColor: 'text-green-900',
                accentColor: 'text-green-500',
                pillBg: 'bg-green-500',
                pillText: 'text-green-900',
                letterBg: 'bg-green-600',
                letterText: 'text-yellow-50',
                cardBg: 'bg-yellow-50',
                bodyText: 'text-stone-700',
                categoryLabel: 'Environmental',
                categoryColor: 'text-green-500',
                title: 'text-green-900',
            };
        }

        // Yellow / Economic
        if (c.includes('economic')) {
            return {
                bg: 'bg-yellow-500',
                shadow: 'shadow-[-2.93px_3.67px_10.36px_0px_rgba(0,0,0,0.10)] shadow-[-11.64px_14.76px_18.79px_0px_rgba(0,0,0,0.09)] shadow-[-26.13px_33.09px_22.92px_0px_rgba(0,0,0,0.05)] shadow-[-46.48px_58.94px_22.92px_0px_rgba(0,0,0,0.01)]',
                textColor: 'text-yellow-900',
                accentColor: 'text-amber-300',
                pillBg: 'bg-amber-300',
                pillText: 'text-yellow-900',
                letterBg: 'bg-yellow-500',
                letterText: 'text-yellow-50',
                cardBg: 'bg-yellow-50',
                bodyText: 'text-stone-700',
                categoryLabel: 'Economic',
                categoryColor: 'text-amber-300',
                title: 'text-yellow-900',
            };
        }

        // Orange / Infrastructure
        if (c.includes('infrastructure')) {
            return {
                bg: 'bg-yellow-600', // Using yellow-600 as base per snippet "bg-yellow-600" but could be orange-500
                shadow: 'shadow-[-2.75px_3.48px_9.81px_0px_rgba(0,0,0,0.10)] shadow-[-11.09px_14.03px_17.88px_0px_rgba(0,0,0,0.09)] shadow-[-24.84px_31.53px_22.92px_0px_rgba(0,0,0,0.05)] shadow-[-44.18px_56.10px_22.92px_0px_rgba(0,0,0,0.01)]',
                textColor: 'text-yellow-900',
                accentColor: 'text-orange-400',
                pillBg: 'bg-orange-400',
                pillText: 'text-yellow-900',
                letterBg: 'bg-yellow-600',
                letterText: 'text-yellow-50',
                cardBg: 'bg-yellow-50',
                bodyText: 'text-stone-700',
                categoryLabel: 'Infrastructure',
                categoryColor: 'text-orange-400',
                title: 'text-yellow-900',
            };
        }

        // Blue / Society
        if (c.includes('society') || c.includes('social')) {
            return {
                bg: 'bg-slate-500',
                shadow: 'shadow-[-3.03px_3.48px_10.18px_0px_rgba(0,0,0,0.10)] shadow-[-12.10px_14.03px_18.52px_0px_rgba(0,0,0,0.09)] shadow-[-27.13px_31.53px_22.92px_0px_rgba(0,0,0,0.05)] shadow-[-48.22px_56.01px_22.92px_0px_rgba(0,0,0,0.01)]',
                textColor: 'text-teal-900',
                accentColor: 'text-slate-400',
                pillBg: 'bg-slate-400',
                pillText: 'text-teal-900',
                letterBg: 'bg-slate-500',
                letterText: 'text-yellow-50',
                cardBg: 'bg-yellow-50',
                bodyText: 'text-stone-700',
                categoryLabel: 'Society',
                categoryColor: 'text-slate-400', // Matching snippet snippet text-slate-400
                title: 'text-teal-900',
            };
        }

        // Red / Political
        if (c.includes('political')) {
            return {
                bg: 'bg-red-600',
                shadow: 'shadow-[-2.84px_3.58px_9.99px_0px_rgba(0,0,0,0.10)] shadow-[-11.37px_14.30px_18.24px_0px_rgba(0,0,0,0.09)] shadow-[-25.48px_32.18px_22.92px_0px_rgba(0,0,0,0.05)] shadow-[-45.38px_57.11px_22.92px_0px_rgba(0,0,0,0.01)]',
                textColor: 'text-red-950',
                accentColor: 'text-red-500',
                pillBg: 'bg-red-500',
                pillText: 'text-red-950',
                letterBg: 'bg-red-600',
                letterText: 'text-yellow-50',
                cardBg: 'bg-yellow-50',
                bodyText: 'text-stone-700',
                categoryLabel: 'Political',
                categoryColor: 'text-red-500',
                title: 'text-red-950',
            };
        }

        // Default Fallback (Green-ish)
        return {
            bg: 'bg-green-600',
            shadow: 'shadow-xl',
            textColor: 'text-green-900',
            accentColor: 'text-green-500',
            pillBg: 'bg-green-500',
            pillText: 'text-green-900',
            letterBg: 'bg-green-600',
            letterText: 'text-yellow-50',
            cardBg: 'bg-yellow-50',
            bodyText: 'text-stone-700',
            categoryLabel: 'Crisis',
            categoryColor: 'text-green-500',
            title: 'text-green-900',
        };
    };

    const theme = getTheme(categoryName);
    const isTimeCritical = timeLeft <= 10 && timeLeft > 0;

    // Helper to get stats in a consistent order
    const getStats = (r: CardResponse) => [
        { val: r.politicalEffect, type: 'pol' },
        { val: r.economicEffect, type: 'eco' },
        { val: r.infrastructureEffect, type: 'inf' },
        { val: r.societyEffect, type: 'soc' },
        { val: r.environmentEffect ?? r.score, type: 'env' },
    ];

    // Global keyboard shortucts
    React.useEffect(() => {
        const handleGlobalKeyPress = (e: KeyboardEvent) => {
            if (disabled) return;
            const key = e.key.toUpperCase();
            const index = key.charCodeAt(0) - 65;
            if (index >= 0 && index < responses.length) {
                e.preventDefault();
                onSelectResponse(responses[index].id);
            }
        };
        window.addEventListener('keydown', handleGlobalKeyPress);
        return () => window.removeEventListener('keydown', handleGlobalKeyPress);
    }, [disabled, responses, onSelectResponse]);

    return (
        <div className={`
             relative w-full max-w-[24rem] sm:max-w-md mx-auto aspect-[3/4]
             ${theme.bg} rounded-lg ${theme.shadow} overflow-hidden
             ${isTimeCritical ? 'animate-pulse ring-4 ring-red-500' : ''}
             transition-all duration-300
        `}>
            {/* Top Decorator Dots */}
            <div className="absolute top-[2%] left-1/2 -translate-x-1/2 flex gap-1 z-20 scale-75 origin-top">
                <div className="w-2 h-2 bg-green-600 rounded-full" />
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <div className="w-2 h-2 bg-slate-500 rounded-full" />
                <div className="w-2 h-2 bg-yellow-600 rounded-full" />
                <div className="w-2 h-2 bg-red-600 rounded-full" />
            </div>

            {/* Title Section */}
            <div className="absolute top-[8%] left-0 w-full flex flex-col items-center gap-1 z-10 px-4">
                <div className={`text-center text-xs sm:text-sm font-black font-['Perfectly_Nostalgic'] uppercase leading-tight ${theme.title}`}>
                    {title}
                </div>
                <div className={`text-center text-[0.6rem] sm:text-xs font-medium font-['Nohemi'] leading-snug px-4 ${theme.title}`}>
                    {description}
                </div>
            </div>

            {/* Category Labels */}
            <div className={`absolute bottom-[4%] left-[15%] text-[0.6rem] sm:text-xs font-bold font-['Perfectly_Nostalgic'] uppercase ${theme.categoryColor}`}>
                {theme.categoryLabel}
            </div>
            <div className={`absolute left-[15%] top-[25%] text-[0.7rem] sm:text-sm font-black font-['Perfectly_Nostalgic'] uppercase ${theme.textColor}`}>
                Response Options
            </div>
            <div className={`absolute right-[15%] top-[25%] text-[0.7rem] sm:text-sm font-black font-['Perfectly_Nostalgic'] uppercase ${theme.textColor}`}>
                {timeLeft} Mins
            </div>
            {/* Note: The "time" was hardcoded in snippet as "3 Mins", using `timeLeft` or `timeLimit` is dynamic */}

            {/* Response Options Container */}
            <div className="absolute top-[32%] w-full px-8 flex flex-col gap-6">
                {responses.map((response, idx) => {
                    const isSelected = selectedResponseId === response.id;
                    const letter = String.fromCharCode(65 + idx);
                    const stats = getStats(response);

                    return (
                        <div key={response.id} className="w-full flex flex-col items-start gap-1 relative group">
                            {/* Selection indicator / Ring */}
                            {isSelected && (
                                <div className="absolute -inset-2 border-2 border-white/50 rounded-lg pointer-events-none animate-pulse" />
                            )}

                            {/* Top Row: Cost Pill */}
                            <div className="w-full flex justify-end">
                                <div className={`
                                    h-4 px-2 flex items-center justify-center rounded-t-sm gap-px
                                    ${theme.pillBg}
                                `}>
                                    <span className={`text-[0.6rem] font-black font-['Nohemi'] ${theme.pillText}`}>
                                        {(response.cost || 0) > 0 ? `-${response.cost}` : `+${Math.abs(response.cost || 0)}`}
                                        {/* Logic Inversion Check: Usually +Cost means spending money (-$). The snippet shows "-1000" in a green card?
                                            Wait, snippet for green option A says "-1000" in pill. text says "Deploy cleanup". Usually cleanup costs money.
                                            Snippet for yellow option A says "-600", text "Offer tax breaks".
                                            Snippet for yellow option 1 (top) says "+0"? or just "0".
                                            I'll stick to displaying the raw value or simple sign logic.
                                            Let's just show the value with sign.
                                         */}
                                    </span>
                                </div>
                            </div>

                            {/* Main Content Row */}
                            <div
                                className="w-full h-8 flex items-stretch cursor-pointer hover:brightness-110 active:scale-[0.99] transition-transform"
                                onClick={() => !disabled && onSelectResponse(response.id)}
                            >
                                {/* Letter Box */}
                                <div className={`
                                    w-8 h-full flex items-center justify-center rounded-l-sm outline outline-1 outline-offset-[-1px] outline-yellow-50
                                    ${theme.letterBg}
                                    ${isSelected ? 'ring-2 ring-white z-10' : ''}
                                `}>
                                    <span className={`text-xs font-black font-['Perfectly_Nostalgic'] ${theme.letterText}`}>
                                        {letter}
                                    </span>
                                </div>

                                {/* Description Box */}
                                <div className={`flex-1 h-full px-3 flex items-center justify-start rounded-r-sm ${theme.cardBg}`}>
                                    <p className={`text-[0.6rem] sm:text-[0.7rem] font-light font-['Nohemi'] leading-tight line-clamp-2 ${theme.bodyText}`}>
                                        {response.text}
                                    </p>
                                </div>
                            </div>

                            {/* Stats Row */}
                            <div className="flex items-center gap-2 pl-1">
                                {stats.map((stat, i) => (
                                    <div key={i} className="flex items-center gap-0.5 min-w-[1rem] justify-center">
                                        <span className={`text-[0.5rem] font-bold font-['Nohemi'] ${theme.textColor}`}>
                                            {(stat.val ?? 0) > 0 ? `+${stat.val}` : (stat.val ?? 0)}
                                        </span>
                                    </div>
                                ))}

                                {/* Vote Count Badge placed near stats if any */}
                                {(votes[response.id] || 0) > 0 && (
                                    <div className="ml-auto bg-white text-black text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                        {votes[response.id]} votes
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
