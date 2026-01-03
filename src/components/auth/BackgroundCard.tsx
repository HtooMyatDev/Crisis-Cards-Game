
import React from 'react';
import { DollarSign, Heart, Clock, Home, Settings } from 'lucide-react';

interface BackgroundCardProps {
    color: string;
    title: string;
    description: string;
    options: { letter: string; text: string; cost: number; stats: number[] }[];
    className?: string;
    mins?: string;
    category?: string;
    pillColors?: string[];
}

export const BackgroundCard: React.FC<BackgroundCardProps> = ({
    color,
    title,
    description,
    options,
    className,
    mins = "5 Mins",
    category = "Society",
    pillColors = ["#399B2C", "#D9AD1F", "#4190A9", "#CA840C", "#CD302F"]
}) => (
    <div className={`w-52 bg-[${color}] rounded-[2.5rem] shadow-2xl flex flex-col items-center relative overflow-hidden ring-4 ring-black/5 ${className}`} style={{ backgroundColor: color }}>
        {/* Top Decor Pill */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#FDFBF7] px-3 py-1.5 rounded-b-[1.2rem] shadow-sm flex -space-x-1 z-20">
            {pillColors.map((c, i) => (
                <div key={i} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
            ))}
        </div>

        <div className="pt-6 pb-2 px-3.5 w-full flex flex-col h-full font-sans">
            {/* Title */}
            <h3 className="font-serif italic text-lg text-[#1a1a1a]/90 leading-none text-center mb-0.5 drop-shadow-sm min-h-[2.5rem] flex items-center justify-center pt-1">
                {title}
            </h3>

            {/* Description */}
            <p className="font-sans text-[0.5rem] leading-tight text-[#1a1a1a]/80 text-center mb-1.5 line-clamp-3 font-medium px-1">
                {description}
            </p>

            {/* Response Options Header */}
            <div className="flex justify-between items-center mb-0.5 px-0.5">
                <span className="font-serif italic text-[0.5rem] text-[#1a1a1a]/60">Response Options</span>
                <span className="font-serif italic text-[0.5rem] text-[#1a1a1a]/60">{mins}</span>
            </div>


            {/* Options */}
            <div className="space-y-1.5 flex-1 mt-0.5">
                {options.map((opt, i) => (
                    <div key={i} className="flex flex-col relative pb-0">
                        {/* Cost Pill Absolute - Positioned top right of the white box */}
                        {opt.cost !== 0 && (
                            <div className="self-end mb-[1px] bg-black/10 px-1 py-[0.5px] rounded-[2px] text-[0.35rem] font-black text-[#1a1a1a]/80 font-sans tracking-tight leading-none">
                                {opt.cost > 0 ? '+' : ''}{opt.cost}
                            </div>
                        )}
                        {!opt.cost && <div className="h-[10px]"></div>} {/* Spacer if no cost to align */}

                        <div className="flex bg-[#FDFBF7] rounded-[4px] overflow-hidden shadow-sm min-h-[1.8rem] items-stretch">
                            {/* Letter Box */}
                            <div className="w-5 flex items-center justify-center shrink-0" style={{ backgroundColor: color, filter: 'brightness(0.95)' }}>
                                <span className="font-serif italic text-white font-bold text-xs">{opt.letter}</span>
                            </div>
                            {/* Text */}
                            <div className="flex-1 px-1.5 py-1.5 flex items-center">
                                <span className="text-[0.4rem] font-semibold text-[#1a1a1a] leading-[1.1] text-left">{opt.text}</span>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center gap-1.5 px-0.5 mt-0.5">
                            {[DollarSign, Heart, Clock, Home, Settings].map((Icon, idx) => (
                                <div key={idx} className="flex items-center gap-[1px]">
                                    <div className="p-[0.5px] rounded-full bg-black/10 flex items-center justify-center">
                                        <Icon size={4} strokeWidth={3} className="text-[#1a1a1a]/70" />
                                    </div>
                                    <span className="text-[0.35rem] font-bold text-[#1a1a1a]/70 leading-none">
                                        {opt.stats[idx] > 0 ? '+' : ''}{opt.stats[idx]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Category */}
            <div className="mt-auto pt-0.5 text-center opacity-60">
                <span className="font-serif text-[0.5rem] tracking-widest uppercase text-[#1a1a1a]">{category}</span>
            </div>
        </div>
    </div>
);
