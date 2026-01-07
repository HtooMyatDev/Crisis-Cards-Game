import React from 'react';
import Link from 'next/link';
import { BackgroundCard } from '@/components/auth/BackgroundCard';

export default function RegisterDisabled() {
    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#3E3E3C] flex items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-300">
            {/* Background Grain */}
            <div className="absolute inset-0 bg-grain pointer-events-none opacity-40 mix-blend-overlay"></div>

            {/* Decorative Elements - High Fidelity Background Cards */}
            <div className="absolute top-[-108px] left-[137px] transform rotate-[35.44deg] opacity-90 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-700">
                <BackgroundCard
                    color="#399B2C"
                    title="Toxic Waste Spill in River"
                    description="Residents along the river fall ill after a factory leaks toxic chemicals, threatening crops and community health."
                    mins="3 Mins"
                    category="Environmental"
                    options={[
                        { letter: 'A', text: 'Deploy emergency cleanup crews with advanced equipment.', cost: -1000, stats: [-3, +3, +2, +1, 0] },
                        { letter: 'B', text: 'Relocate communities & wait for natural recovery.', cost: -400, stats: [-2, -1, -1, -1, 0] },
                        { letter: 'C', text: 'Ignore and let the factory keep operating.', cost: +200, stats: [+1, -3, -5, -2, 0] }
                    ]}
                    className="h-[259px] w-[185px]"
                />
            </div>

            <div className="absolute top-[391px] left-[-46px] transform -rotate-[18.3deg] opacity-80 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-700">
                <BackgroundCard
                    color="#4190A9"
                    title="Urban Decay"
                    description="A once-prosperous neighborhood has fallen into disrepair, with abandoned buildings and rising crime."
                    mins="5 Mins"
                    category="Society"
                    options={[
                        { letter: 'A', text: 'Increase police patrols and fund a few small renovation projects.', cost: -300, stats: [-1, +2, 0, +1, +1] },
                        { letter: 'B', text: 'Launch a community project to restore the area and provide tax breaks for new businesses.', cost: -600, stats: [+3, +5, +1, +4, +3] },
                        { letter: 'C', text: 'Sell the land to a large developer for a single, massive project.', cost: +500, stats: [+2, -3, -1, -2, +2] }
                    ]}
                    className="h-[259px] w-[185px]"
                />
            </div>

            <div className="absolute top-[50px] left-[1079px] transform -rotate-[55.79deg] opacity-80 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-700">
                <BackgroundCard
                    color="#D9AD1F"
                    title="City Housing Crisis"
                    description="A city's population is growing fast, leading to a shortage of housing and sky-high rents."
                    mins="4 Mins"
                    category="Economic"
                    options={[
                        { letter: 'A', text: 'Offer tax breaks to developers who build new housing.', cost: -600, stats: [+1, +1, 0, +1, 0] },
                        { letter: 'B', text: 'Fund a massive public housing project and change zoning laws.', cost: -1500, stats: [+2, +5, +2, +3, +4] },
                        { letter: 'C', text: 'Let the market decide and do not interfere', cost: 0, stats: [-2, -4, 0, -2, 0] }
                    ]}
                    className="h-[259px] w-[185px]"
                />
            </div>

            <div className="absolute top-[485px] left-[1219px] transform -rotate-[127.88deg] opacity-80 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-700">
                <BackgroundCard
                    color="#CD302F"
                    title="International Climate Summit"
                    description="Your country is asked to raise its climate commitments at a global summit."
                    mins="5 Mins"
                    category="Political"
                    options={[
                        { letter: 'A', text: 'Commit to bold new targets and invest heavily in renewables.', cost: -1200, stats: [-1, +2, +5, +4, +3] },
                        { letter: 'B', text: 'Pledge modest targets with limited sustainable projects.', cost: -600, stats: [+1, +1, +2, +1, 0] },
                        { letter: 'C', text: 'Refuse new pledges and defend domestic industries.', cost: +400, stats: [+2, -2, -4, -3, 0] }
                    ]}
                    className="h-[259px] w-[185px]"
                />
            </div>

            <div className="absolute top-[697px] left-[535px] transform rotate-[62.31deg] opacity-70 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-700 z-0">
                <BackgroundCard
                    color="#CA840C"
                    title="Deteriorating Water Pipes"
                    description="An old city water system has frequent pipe bursts, leading to widespread leaks and water waste."
                    mins="3 Mins"
                    category="Infrastructure"
                    options={[
                        { letter: 'A', text: 'Replace broken pipes with modern materials.', cost: -800, stats: [+2, +1, 0, 0, +3] },
                        { letter: 'B', text: 'Fund a complete overhaul of the entire water grid.', cost: -2000, stats: [-2, +4, +1, +3, +5] },
                        { letter: 'C', text: 'Use temporary patches and encourage water conservation.', cost: -100, stats: [-1, -2, -1, -2, -3] }
                    ]}
                    className="h-[259px] w-[185px]"
                />
            </div>

            {/* Top Logo */}
            <div className="absolute top-10 flex flex-col items-center gap-1">
                <h2 className="text-4xl font-serif italic text-black/80 dark:text-[#FDFBF7]">Cards of Crisis</h2>
                <div className="flex -space-x-1.5 border-[3px] border-[#333] dark:border-[#FDFBF7] px-3 py-1.5 rounded-full bg-transparent items-center">
                    <div className="w-4 h-4 rounded-full bg-[#399B2C] z-0"></div>
                    <div className="w-4 h-4 rounded-full bg-[#D9AD1F] z-10"></div>
                    <div className="w-4 h-4 rounded-full bg-[#4190A9] z-20"></div>
                    <div className="w-4 h-4 rounded-full bg-[#CA840C] z-30"></div>
                    <div className="w-4 h-4 rounded-full bg-[#CD302F] z-40"></div>
                </div>
            </div>

            <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="bg-white/80 dark:bg-black/60 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-8 text-center relative overflow-hidden">
                    {/* Glass Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

                    <h2 className="text-3xl font-serif text-gray-900 dark:text-white mb-4 drop-shadow-sm">
                        Registration Disabled
                    </h2>
                    <p className="mt-2 text-base text-gray-600 dark:text-gray-300 font-sans leading-relaxed">
                        New account registration is currently turned off. Please contact the administrator if you believe this is an error.
                    </p>
                    <div className="mt-8">
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center justify-center px-6 py-3 w-full rounded-xl font-bold text-base
                            bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10
                            text-gray-900 dark:text-white
                            hover:bg-gray-50 dark:hover:bg-white/20 hover:scale-[1.02]
                            transition-all duration-300 shadow-sm font-serif"
                        >
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>

            {/* Bottom Footer Logos */}
            <div className="absolute bottom-6 right-6 flex items-center gap-6 opacity-80 pointer-events-none hidden md:flex">
                <div className="flex flex-col items-center">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-[#FCD34D] drop-shadow-sm">
                            <path d="M12 2C13.1 2 14 2.9 14 4V10H20C21.1 10 22 10.9 22 12C22 13.1 21.1 14 20 14H14V20C14 21.1 13.1 22 12 22C10.9 22 10 21.1 10 20V14H4C2.9 14 2 13.1 2 12C2 10.9 2.9 10 4 10H10V4C10 2.9 10.9 2 12 2Z" fill="currentColor" />
                            <circle cx="12" cy="12" r="2" className="fill-[#FDFBF7] dark:fill-[#3E3E3C]" />
                        </svg>
                    </div>
                    <div className="text-[10px] font-bold text-[#333] dark:text-[#FDFBF7] mt-1 leading-[0.9] text-left font-[family-name:var(--font-pixel)] tracking-wide">
                        the<br />change<br />lab
                    </div>
                </div>
                <div className="h-8 w-[1px] bg-[#333] dark:bg-[#FDFBF7]"></div>
                <div className="flex flex-col items-center">
                    <span className="text-lg font-serif italic font-bold text-[#333] dark:text-[#FDFBF7]">Cards of Crisis</span>
                    <div className="flex -space-x-1 mt-0.5 border-[2px] border-[#333] dark:border-[#FDFBF7] px-1.5 py-0.5 rounded-full">
                        <div className="w-2.5 h-2.5 bg-[#399B2C] rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-[#D9AD1F] rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-[#4190A9] rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-[#CA840C] rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-[#CD302F] rounded-full"></div>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-6 left-6 opacity-80 pointer-events-none hidden md:block">
                <div className="flex items-center gap-1">
                    {/* Left Triangle - Points Left */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="transform rotate-90 text-[#333] dark:text-[#FDFBF7]">
                        <path d="M20.5 14.5L13.5 21.5C12.7 22.3 11.3 22.3 10.5 21.5L3.5 14.5C2 13 3 10.5 5 10.5H19C21 10.5 22 13 20.5 14.5Z" />
                    </svg>
                    <div className="font-black text-[#333] dark:text-[#FDFBF7] text-[0.65rem] leading-[0.85] flex flex-col tracking-tighter uppercase font-sans">
                        <span className="self-start">Doing</span>
                        <span className="self-end">More With</span>
                        <span className="self-end">Less</span>
                    </div>
                    {/* Right Triangle - Points Right */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="transform -rotate-90 text-[#333] dark:text-[#FDFBF7]">
                        <path d="M20.5 14.5L13.5 21.5C12.7 22.3 11.3 22.3 10.5 21.5L3.5 14.5C2 13 3 10.5 5 10.5H19C21 10.5 22 13 20.5 14.5Z" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
