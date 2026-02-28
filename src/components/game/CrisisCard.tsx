import React from 'react';
import { Clock } from 'lucide-react';
import {
    EnvironmentIcon,
    FinancialIcon,
    GovernmentIcon,
    LifeIcon,
    SettingsIcon,
    TopLogo
} from './CategoryIcons';

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
                bg: 'bg-[#399B2C]',
                shadow: 'shadow-2xl shadow-black/40',
                textColor: 'text-[#FDFAE5]',
                accentColor: 'text-[#FDFAE5]',
                pillBg: 'bg-[#FDFAE5]',
                pillText: 'text-[#399B2C]',
                letterBg: 'bg-[#399B2C]',
                letterText: 'text-[#FDFAE5]',
                cardBg: 'bg-[#FDFAE5]',
                bodyText: 'text-[#3F3D39]',
                categoryLabel: 'Environmental',
                categoryColor: 'text-[#FDFAE5]/80',
                title: 'text-[#FDFAE5]',
                statPillBg: 'bg-[#195012]',
                statPillBgColor: '#195012',
                statPillTextColor: '#399B2C',
            };
        }

        // Economic (MARKET CRASH) - Blue Background
        if (c.includes('economic')) {
            return {
                bg: 'bg-[#4190A9]',
                shadow: 'shadow-2xl shadow-black/40',
                textColor: 'text-[#FDFAE5]',
                accentColor: 'text-[#133F4D]',
                pillBg: 'bg-[#67ACC2]',
                pillText: 'text-[#133F4D]',
                letterBg: 'bg-[#4190A9]',
                letterText: 'text-[#FDFAE5]',
                cardBg: 'bg-[#FDFAE5]',
                bodyText: 'text-[#3F3D39]',
                categoryLabel: 'Economic',
                categoryColor: 'text-[#FDFAE5]/80',
                title: 'text-[#FDFAE5]',
                statPillBg: 'bg-[#133F4D]',
                statPillBgColor: '#133F4D',
                statPillTextColor: '#4190A9',
            };
        }

        // Society (SOCIAL UNREST) - Yellow Background
        if (c.includes('society') || c.includes('social')) {
            return {
                bg: 'bg-[#D9AD1F]',
                shadow: 'shadow-2xl shadow-black/40',
                textColor: 'text-[#FDFAE5]',
                accentColor: 'text-[#665315]',
                pillBg: 'bg-[#EFC43C]',
                pillText: 'text-[#665315]',
                letterBg: 'bg-[#D9AD1F]',
                letterText: 'text-[#FDFAE5]',
                cardBg: 'bg-[#FDFAE5]',
                bodyText: 'text-[#3F3D39]',
                categoryLabel: 'Society',
                categoryColor: 'text-[#FDFAE5]/80',
                title: 'text-[#FDFAE5]',
                statPillBg: 'bg-[#665315]',
                statPillBgColor: '#665315',
                statPillTextColor: '#D9AD1F',
            };
        }

        // Brown / Infrastructure
        if (c.includes('infrastructure')) {
            return {
                bg: 'bg-[#CA840C]',
                shadow: 'shadow-2xl shadow-black/40',
                textColor: 'text-[#FDFAE5]',
                accentColor: 'text-[#665315]', // Using dark brown
                pillBg: 'bg-[#F2AE31]', // Estimating from society brand
                pillText: 'text-[#665315]',
                letterBg: 'bg-[#CA840C]',
                letterText: 'text-[#FDFAE5]',
                cardBg: 'bg-[#FDFAE5]',
                bodyText: 'text-[#3F3D39]',
                categoryLabel: 'Infrastructure',
                categoryColor: 'text-[#FDFAE5]/80',
                title: 'text-[#FDFAE5]',
                statPillBg: 'bg-[#665315]',
                statPillBgColor: '#665315',
                statPillTextColor: '#CA840C',
            };
        }

        // Red / Political
        if (c.includes('political')) {
            return {
                bg: 'bg-[#CD302F]',
                shadow: 'shadow-2xl shadow-black/40',
                textColor: 'text-[#FDFAE5]',
                accentColor: 'text-[#641616]',
                pillBg: 'bg-[#F35251]',
                pillText: 'text-[#641616]',
                letterBg: 'bg-[#CD302F]',
                letterText: 'text-[#FDFAE5]',
                cardBg: 'bg-[#FDFAE5]',
                bodyText: 'text-[#3F3D39]',
                categoryLabel: 'Political',
                categoryColor: 'text-[#FDFAE5]/80',
                title: 'text-[#FDFAE5] font-serif italic font-bold',
                statPillBg: 'bg-[#450F0F]',
                statPillBgColor: '#450F0F',
                statPillTextColor: '#CD302F',
                headerText: 'text-[#FDFAE5]/90 font-serif italic font-bold',
            };
        }

        // Default Fallback (Green-ish)
        return {
            bg: 'bg-[#1B4332]',
            shadow: 'shadow-2xl shadow-black/40',
            textColor: 'text-[#FDFAE5]',
            accentColor: 'text-green-400',
            pillBg: 'bg-green-400',
            pillText: 'text-[#1B4332]',
            letterBg: 'bg-[#1B4332]',
            letterText: 'text-[#FDFAE5]',
            cardBg: 'bg-[#FDFAE5]',
            bodyText: 'text-[#061A13]',
            categoryLabel: 'Crisis',
            categoryColor: 'text-[#FDFAE5]/70',
            title: 'text-[#FDFAE5] font-serif italic font-bold',
            statPillBg: 'bg-[#061A13]',
            statPillBgColor: '#061A13',
            statPillTextColor: '#FDFAE5',
            headerText: 'text-[#FDFAE5]/90 font-serif italic font-bold',
        };
    };

    const theme = getTheme(categoryName);
    const isTimeCritical = timeLeft <= 10 && timeLeft > 0;


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
            relative w-full max-w-[24rem] sm:max-w-md mx-auto aspect-[5/7]
            ${theme.bg} rounded-[24px] ${theme.shadow} overflow-hidden
            ${isTimeCritical ? 'animate-pulse ring-4 ring-red-500' : ''}
            transition-all duration-300
        `}>
            {/* Playing Card Inset Border */}
            <div className="absolute inset-[10px] rounded-[16px] border-[1px] border-[#FDFAE5]/40 pointer-events-none z-20"></div>

            {/* Header Pill Logo Section */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center group pointer-events-none">
                <TopLogo className="w-24 h-auto drop-shadow-sm" />
            </div>

            {/* Title Section - Top 16% */}
            <div className="absolute top-[16%] left-0 w-full flex flex-col items-center gap-2 z-10 px-8">
                <div
                    className={`text-center text-xl sm:text-3xl font-serif italic font-bold tracking-tight leading-tight`}
                    style={{ color: theme.statPillBgColor }}
                >
                    {title}
                </div>
                <div
                    className={`text-center text-[0.75rem] sm:text-[0.85rem] font-medium font-sans leading-snug max-w-[92%]`}
                    style={{ color: theme.statPillBgColor, opacity: 0.9 }}
                >
                    {description}
                </div>
            </div>

            {/* Response Headers - Top 32% */}
            <div
                className={`absolute top-[32%] left-[8%] text-[1rem] sm:text-2xl font-serif italic font-bold leading-none`}
                style={{ color: theme.statPillBgColor }}
            >
                Response Options
            </div>
            <div
                className={`absolute top-[32%] right-[8%] flex items-center gap-1.5 opacity-90`}
                style={{ color: theme.statPillBgColor }}
            >
                <Clock size={16} strokeWidth={2.5} />
                <span className="text-[1rem] sm:text-2xl font-serif italic font-bold leading-none">
                    {timeLeft} Mins
                </span>
            </div>
            {/* Note: The "time" was hardcoded in snippet as "3 Mins", using `timeLeft` or `timeLimit` is dynamic */}

            {/* Response Options Container - Fixed Positioning for stability */}
            <div className="absolute top-[38%] w-full px-6 flex flex-col items-center">
                {responses.slice(0, 3).map((response, idx) => {
                    const isSelected = selectedResponseId === response.id;
                    const letter = String.fromCharCode(65 + idx);

                    // Fixed offsets for 3 responses (shifted slightly more to use room)
                    const topOffsets = ['top-0', 'top-[31%]', 'top-[62%]'];
                    const currentOffset = topOffsets[idx] || '';

                    return (
                        <div key={response.id} className={`absolute ${currentOffset} w-[92%] flex flex-col gap-1`}>
                            {/* Hovering Cost Pill */}
                            <div className="absolute -top-3.5 right-4 z-40">
                                <div className={`px-4 py-1 rounded-md shadow-md border border-black/10 ${theme.pillBg}`}>
                                    <span className={`text-[0.7rem] sm:text-xs font-bold font-sans ${theme.pillText}`}>
                                        {(response.cost || 0) > 0 ? `-${response.cost}` : response.cost || '0'}
                                    </span>
                                </div>
                            </div>

                            {/* Response Unit with White Border */}
                            <button
                                className={`
                                    w-full flex items-stretch transition-all duration-200
                                    rounded-xl border-[2.5px] border-[#FDFAE5] overflow-hidden shadow-lg
                                    ${isSelected ? 'scale-[1.02] ring-2 ring-white/50' : 'hover:scale-[1.01] active:scale-[0.98]'}
                                `}
                                onClick={() => !disabled && onSelectResponse(response.id)}
                                disabled={disabled}
                            >
                                {/* Letter Box - Fixed width, Category Color */}
                                <div className={`w-10 sm:w-12 flex items-center justify-center ${theme.bg}`}>
                                    <span className="text-lg sm:text-xl font-serif italic font-bold text-[#FDFAE5]">
                                        {letter}
                                    </span>
                                </div>

                                {/* Description Box - Cream BG */}
                                <div className="flex-1 bg-[#FDFAE5] py-2 px-3 sm:py-2.5 sm:px-4 flex items-center text-left min-h-[2.6rem]">
                                    <p
                                        className="text-[0.75rem] sm:text-[0.85rem] font-medium font-sans leading-tight line-clamp-2"
                                        style={{ color: theme.statPillTextColor }}
                                    >
                                        {response.text}
                                    </p>
                                </div>
                            </button>

                            {/* Stat Impacts Row - Left-aligned grid for perfect vertical parity */}
                            <div className="grid grid-cols-5 gap-x-1 sm:gap-x-2 w-fit px-2 py-1">
                                {[
                                    { id: 'eco', icon: FinancialIcon, val: response.economicEffect },
                                    { id: 'soc', icon: LifeIcon, val: response.societyEffect },
                                    { id: 'env', icon: EnvironmentIcon, val: response.environmentEffect },
                                    { id: 'pol', icon: GovernmentIcon, val: response.politicalEffect },
                                    { id: 'inf', icon: SettingsIcon, val: response.infrastructureEffect }
                                ].map((stat) => {
                                    const Icon = stat.icon;
                                    return (
                                        <div key={stat.id} className="flex items-center gap-1 min-w-[2rem] sm:min-w-[2.2rem] opacity-95">
                                            <div
                                                className="w-4 h-4 shrink-0 rounded-full flex items-center justify-center shadow-sm"
                                                style={{ backgroundColor: theme.statPillBgColor }}
                                            >
                                                <Icon size={12} style={{ color: theme.statPillTextColor }} />
                                            </div>
                                            {/* Count matches pill background color as requested */}
                                            <span
                                                className="text-[0.5rem] sm:text-[0.55rem] font-black whitespace-nowrap"
                                                style={{ color: theme.statPillBgColor }}
                                            >
                                                {stat.val && (stat.val > 0 ? `+${stat.val}` : stat.val)}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            {/* Vote Count Badge placed near stats if any */}
                            {(votes[response.id] || 0) > 0 && (
                                <div className="ml-auto bg-white text-black text-[0.6rem] font-bold px-1.5 py-0.5 rounded-full shadow-sm">
                                    {votes[response.id]} votes
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div >
    );
};
