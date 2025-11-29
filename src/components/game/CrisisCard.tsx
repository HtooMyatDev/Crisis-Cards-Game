import React from 'react';
import { Shield, TrendingUp, Building2, Users, Leaf, Clock, Keyboard } from 'lucide-react';
import { formatEffect, getEffectColor } from '@/utils/colorUtils';
import { getCardTheme } from '@/utils/cardTheme';

interface CardResponse {
    id: number;
    text: string;
    score?: number;
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
    political: number;
    economic: number;
    infrastructure: number;
    society: number;
    environment: number;
    responses: CardResponse[];
    selectedResponseId: number | null;
    onSelectResponse: (id: number) => void;
    disabled: boolean;
    isLeader: boolean;
    votes?: Record<number, number>;
    timeLeft: number;
    categoryName?: string;
    categoryColor?: string;
    colorPreset?: {
        backgroundColor: string;
        textColor: string;
        textBoxColor: string;
    };
}

export const CrisisCard: React.FC<CrisisCardProps> = ({
    title,
    description,
    timeLimit,
    political,
    economic,
    infrastructure,
    society,
    environment,
    responses,
    selectedResponseId,
    onSelectResponse,
    disabled,
    isLeader,
    votes = {},
    timeLeft,
    categoryName,
    categoryColor,
    colorPreset
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

    // Determine if time is running low
    const isTimeLow = timeLeft <= 30 && timeLeft > 0;
    const isTimeCritical = timeLeft <= 10 && timeLeft > 0;

    return (
        <div className={`
            relative w-full max-w-lg mx-auto rounded-[2rem] p-10 shadow-[8px_8px_0px_0px_rgba(180,83,9,0.1)] dark:shadow-[8px_8px_0px_0px_rgba(0,0,0,0.3)]
            transition-all duration-500
            bg-gradient-to-br from-[#FFF8D6] to-[#FDE68A] dark:from-gray-800 dark:to-gray-900
            border-4 border-[#FCD34D] dark:border-gray-700
            text-[#5D4037] dark:text-gray-200
            ${isTimeCritical ? 'animate-pulse ring-4 ring-red-500 dark:ring-red-600' : ''}
            ${isTimeLow ? 'ring-2 ring-orange-400 dark:ring-orange-500' : ''}
        `}>
            {/* Keyboard Hint Badge */}
            <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 bg-gray-800 dark:bg-gray-700 text-white rounded-full text-xs font-bold shadow-lg">
                <Keyboard size={14} />
                <span>Use A-D keys</span>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
                <div className="inline-block px-5 py-2 bg-[#FCD34D] dark:bg-blue-600 rounded-full text-[#B45309] dark:text-white font-black text-sm mb-5 shadow-sm border-2 border-[#F59E0B] dark:border-blue-500">
                    {categoryName?.toUpperCase() || 'CRISIS'}
                </div>
                <h2 className="font-black text-4xl text-[#78350F] dark:text-white mb-4 tracking-tight drop-shadow-sm">
                    {title}
                </h2>
                <p className="text-[#92400E]/90 dark:text-gray-300 text-lg font-medium leading-relaxed px-4">
                    {description || "Enter a description to see it here..."}
                </p>
            </div>

            {/* Response Options Header */}
            <div className="flex justify-between items-end mb-4 px-2">
                <h3 className="font-black text-[#92400E] dark:text-gray-200 text-xl uppercase tracking-wide">Response Options</h3>
                {isLeader && Object.keys(votes).length > 0 && (
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-full">
                        👑 Leader View
                    </span>
                )}
            </div>

            {/* Response Options */}
            <div className="space-y-4 mb-10" role="radiogroup" aria-label="Response options">
                {responses.map((response, idx) => {
                    const isSelected = selectedResponseId === response.id;
                    const letter = String.fromCharCode(65 + idx); // A, B, C...
                    const voteCount = votes[response.id] || 0;
                    const hasVotes = voteCount > 0;

                    return (
                        <div key={response.id} className="relative group">
                            <button
                                onClick={() => !disabled && onSelectResponse(response.id)}
                                onKeyDown={(e) => handleKeyDown(e, response.id)}
                                disabled={disabled}
                                role="radio"
                                aria-checked={isSelected}
                                aria-label={`Option ${letter}: ${response.text}`}
                                aria-disabled={disabled}
                                tabIndex={disabled ? -1 : 0}
                                className={`
                                    w-full relative rounded-2xl p-5 transition-all duration-300 text-left
                                    ${isSelected
                                        ? 'bg-[#FEF3C7] dark:bg-blue-900/40 ring-4 ring-[#F59E0B] dark:ring-blue-500 shadow-lg scale-[1.02] transform'
                                        : 'bg-[#FFFBEB] dark:bg-gray-800 hover:bg-[#FEF3C7] dark:hover:bg-gray-700 border-2 border-[#FDE68A] dark:border-gray-600 shadow-sm hover:shadow-md hover:scale-[1.01]'
                                    }
                                    ${disabled && !isSelected ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                                `}
                            >
                                {/* Vote Count Badge (for leaders) */}
                                {isLeader && hasVotes && (
                                    <div className="absolute -top-2 -right-2 bg-blue-600 dark:bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-black text-sm shadow-lg border-2 border-white dark:border-gray-800 animate-bounce">
                                        {voteCount}
                                    </div>
                                )}

                                <div className="flex items-start gap-5">
                                    {/* Letter Circle with Keyboard Hint */}
                                    <div className="flex flex-col items-center gap-1">
                                        <div className={`
                                            w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full
                                            ${isSelected
                                                ? 'bg-[#F59E0B] dark:bg-blue-600 text-white shadow-md ring-2 ring-white dark:ring-gray-800'
                                                : 'bg-[#FCD34D] dark:bg-gray-700 text-[#92400E] dark:text-gray-300'
                                            }
                                            font-black text-lg transition-all duration-200 border-2 border-[#F59E0B]/20 dark:border-gray-600
                                            ${!disabled && 'group-hover:scale-110'}
                                        `}>
                                            {letter}
                                        </div>
                                        {!disabled && (
                                            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                Key: {letter}
                                            </span>
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-grow">
                                        <p className="text-[#78350F] dark:text-white font-bold text-lg leading-snug mb-3">
                                            {response.text || `Response option ${idx + 1}`}
                                        </p>

                                        {/* Effects Row */}
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                { label: 'POL', val: response.politicalEffect },
                                                { label: 'ECO', val: response.economicEffect },
                                                { label: 'INF', val: response.infrastructureEffect },
                                                { label: 'SOC', val: response.societyEffect },
                                                { label: 'ENV', val: response.environmentEffect },
                                            ].map((effect, i) => (
                                                <span
                                                    key={i}
                                                    className={`
                                                        px-2.5 py-1 rounded-md text-[11px] font-bold shadow-sm border
                                                        ${effect.val && effect.val > 0
                                                            ? 'bg-green-600 dark:bg-green-700 text-white border-green-700 dark:border-green-600'
                                                            : effect.val && effect.val < 0
                                                                ? 'bg-red-600 dark:bg-red-700 text-white border-red-700 dark:border-red-600'
                                                                : 'bg-[#78350F] dark:bg-gray-700 text-white border-[#92400E] dark:border-gray-600'
                                                        }
                                                    `}
                                                >
                                                    {effect.label}: {effect.val && effect.val > 0 ? '+' : ''}{effect.val || 0}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Selection Indicator */}
                                {isSelected && (
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[#F59E0B]/10 to-transparent dark:from-blue-500/10 pointer-events-none" />
                                )}
                            </button>
                        </div>
                    );
                })}

                {/* Empty Slots Placeholders */}
                {Array.from({ length: Math.max(0, 3 - responses.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-full rounded-2xl p-5 border-3 border-dashed border-[#FDE68A] dark:border-gray-700 bg-[#FFFBEB]/30 dark:bg-gray-800/30 flex items-center gap-5 opacity-60 hover:opacity-80 transition-opacity">
                        <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full border-3 border-dashed border-[#FCD34D] dark:border-gray-600 text-[#FCD34D] dark:text-gray-500 font-black text-lg">
                            {String.fromCharCode(65 + responses.length + i)}
                        </div>
                        <span className="text-[#92400E]/50 dark:text-gray-500 font-bold italic text-lg">Add another response option</span>
                    </div>
                ))}
            </div>

            {/* Base Stats Footer */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
                {[
                    { label: 'Base POL', val: political },
                    { label: 'Base ECO', val: economic },
                    { label: 'Base INF', val: infrastructure },
                    { label: 'Base SOC', val: society },
                    { label: 'Base ENV', val: environment },
                ].map((stat, i) => (
                    <div key={i} className="px-4 py-2 bg-[#E7D6B9]/80 dark:bg-gray-700/80 backdrop-blur-sm rounded-xl text-[#78350F] dark:text-gray-200 text-xs font-black shadow-sm border border-[#D4C5A8] dark:border-gray-600">
                        {stat.label}: {stat.val > 0 ? '+' : ''}{stat.val}
                    </div>
                ))}
            </div>

            {/* Footer Info */}
            <div className="text-center border-t border-[#FCD34D]/50 dark:border-gray-700 pt-6">
                <p className="text-[#92400E]/70 dark:text-gray-400 text-sm font-bold uppercase tracking-widest">
                    {categoryName || 'Crisis'} • Time Limit: {timeLimit || 1} min
                </p>
            </div>

            {/* Time Warning Overlay */}
            {isTimeCritical && (
                <div className="absolute inset-0 rounded-[2rem] pointer-events-none">
                    <div className="absolute inset-0 bg-red-500/10 dark:bg-red-600/20 rounded-[2rem] animate-pulse" />
                </div>
            )}
        </div>
    );
};
