import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldAlert, Users, PieChart, Activity, Globe2, Trophy } from 'lucide-react';
import { BackgroundCard } from '@/components/auth/BackgroundCard';
import { cookies } from 'next/headers';

export default async function LandingPage() {
    const cookieStore = await cookies();
    const userRole = cookieStore.get("role")?.value;
    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#3E3E3C] flex flex-col relative overflow-hidden font-sans transition-colors duration-300">
            {/* Background Grain */}
            <div className="absolute inset-0 bg-grain pointer-events-none opacity-40 mix-blend-overlay fixed"></div>

            {/* News Ticker */}
            <div className="w-full bg-red-600/10 border-b border-red-500/20 py-3 overflow-hidden flex whitespace-nowrap relative z-50 backdrop-blur-sm">
                {/* <div className="animate-marquee flex gap-12 text-red-600 dark:text-red-400 font-mono text-sm uppercase tracking-widest font-bold"> */}
                <div className="font-bold text-red-600 dark:text-red-400 font-mono text-sm uppercase tracking-widest flex gap-15 animate-marquee">
                    <span className="flex items-center gap-2">⚠ BREAKING: Toxic spill reported in Sector 4</span>
                    <span className="flex items-center gap-2">⚠ MARKET ALERT: Inflation rises by 12%</span>
                    <span className="flex items-center gap-2">⚠ SYSTEM: Admin access required for override</span>
                    <span className="flex items-center gap-2">⚠ WEATHER: Category 5 storm approaching coast</span>
                    <span className="flex items-center gap-2">⚠ UPDATE: Global resource shortage imminent</span>
                    <span className="flex items-center gap-2">⚠ BREAKING: Toxic spill reported in Sector 4</span>
                    <span className="flex items-center gap-2">⚠ MARKET ALERT: Inflation rises by 12%</span>
                    <span className="flex items-center gap-2">⚠ SYSTEM: Admin access required for override</span>
                    <span className="flex items-center gap-2">⚠ WEATHER: Category 5 storm approaching coast</span>
                </div>
            </div>

            {/* Content Container */}
            <main className="flex-1 flex flex-col items-center justify-center relative p-4 pb-20 pt-10">

                {/* Decorative Elements - High Fidelity Background Cards */}
                <div className="absolute top-[10%] left-[5%] transform rotate-[35.44deg] opacity-60 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-700 z-0">
                    <BackgroundCard
                        color="#399B2C"
                        title="Toxic Waste Spill in River"
                        description="Residents along the river fall ill after a factory leaks toxic chemicals."
                        mins="3 Mins"
                        category="Environmental"
                        options={[]}
                        className="h-[200px] w-[140px] scale-75"
                    />
                </div>
                <div className="absolute top-[20%] right-[8%] transform -rotate-[15deg] opacity-50 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-700 z-0">
                    <BackgroundCard
                        color="#4190A9"
                        title="Urban Decay"
                        description="A once-prosperous neighborhood has fallen into disrepair."
                        mins="5 Mins"
                        category="Society"
                        options={[]}
                        className="h-[200px] w-[140px] scale-75"
                    />
                </div>
                <div className="absolute bottom-[20%] left-[10%] transform -rotate-[50deg] opacity-50 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-700 z-0">
                    <BackgroundCard
                        color="#CD302F"
                        title="Climate Summit"
                        description="Commit to bold new targets and invest heavily in renewables."
                        mins="5 Mins"
                        category="Political"
                        options={[]}
                        className="h-[200px] w-[140px] scale-75"
                    />
                </div>


                {/* Top Logo */}
                <div className="flex flex-col items-center gap-2 mb-12 z-10 animate-in fade-in slide-in-from-top-4 duration-700">
                    <h2 className="text-3xl md:text-4xl font-serif italic text-black/80 dark:text-[#FDFBF7]">Cards of Crisis</h2>
                    {/* 5 Color bar with border */}
                    <div className="flex -space-x-1.5 border-[3px] border-[#333] dark:border-[#FDFBF7] px-3 py-1.5 rounded-full bg-transparent items-center">
                        <div className="w-4 h-4 rounded-full bg-[#399B2C] border border-white/0 z-0"></div>
                        <div className="w-4 h-4 rounded-full bg-[#D9AD1F] border border-white/0 z-10"></div>
                        <div className="w-4 h-4 rounded-full bg-[#4190A9] border border-white/0 z-20"></div>
                        <div className="w-4 h-4 rounded-full bg-[#CA840C] border border-white/0 z-30"></div>
                        <div className="w-4 h-4 rounded-full bg-[#CD302F] border border-white/0 z-40"></div>
                    </div>
                </div>

                {/* Main Hero */}
                <div className="relative z-10 w-full max-w-4xl text-center flex flex-col items-center justify-center mb-24 animate-in fade-in zoom-in duration-700">
                    <h1 className="text-6xl md:text-9xl font-serif italic text-black/90 dark:text-[#FDFBF7] mb-8 leading-[0.9] tracking-tight drop-shadow-sm">
                        Crisis <br /> Simulation
                    </h1>

                    <p className="text-xl md:text-2xl text-black/60 dark:text-[#FDFBF7]/60 max-w-2xl mb-12 font-medium leading-relaxed font-sans px-4">
                        Manage resources, make tough decisions, and lead your nation through global crises in this high-stakes simulation.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto items-center justify-center p-4">
                        {userRole != "ADMIN" && (
                            <Link
                                href={process.env.NODE_ENV === 'production' ? "https://crisis-cards-game-live.vercel.app/" : "/live"}
                                className="group relative bg-[#333] dark:bg-[#FDFBF7] text-[#FDFBF7] dark:text-[#3E3E3C] text-2xl font-serif italic px-12 py-5 rounded-xl hover:bg-black dark:hover:bg-white transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none duration-200 w-full sm:w-auto text-center"
                            >
                                <span className="flex items-center justify-center gap-3">
                                    Enter Simulation <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
                                </span>
                            </Link>
                        )}

                        <Link
                            href="/auth/login"
                            className="group bg-transparent border-[3px] border-[#333] dark:border-[#FDFBF7] text-[#333] dark:text-[#FDFBF7] text-xl font-bold font-sans px-10 py-5 rounded-xl hover:bg-[#333]/5 dark:hover:bg-[#FDFBF7]/10 transition-all hover:scale-105 duration-300 w-full sm:w-auto text-center"
                        >
                            Admin Access
                        </Link>
                    </div>

                    {/* Live Stats */}
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16 mt-16 text-[#333]/40 dark:text-[#FDFBF7]/40 font-mono text-sm font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                        <div className="flex flex-col items-center gap-1">
                            <Activity className="w-6 h-6 mb-1 opacity-50" />
                            <span className="text-2xl text-[#333] dark:text-[#FDFBF7]">1,240</span>
                            <span>Crises Averted</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <Globe2 className="w-6 h-6 mb-1 opacity-50" />
                            <span className="text-2xl text-[#333] dark:text-[#FDFBF7]">45</span>
                            <span>Active Nations</span>
                        </div>
                        <div className="flex flex-col items-center gap-1">
                            <Trophy className="w-6 h-6 mb-1 opacity-50" />
                            <span className="text-2xl text-[#333] dark:text-[#FDFBF7]">92%</span>
                            <span>Survival Rate</span>
                        </div>
                    </div>
                </div>

                {/* How It Works Section */}
                <div className="w-full max-w-6xl px-4 py-16 md:py-24 relative z-10 border-t border-[#333]/10 dark:border-[#FDFBF7]/10">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-serif italic text-black/90 dark:text-[#FDFBF7] mb-4">How It Works</h2>
                        <p className="text-lg text-black/50 dark:text-[#FDFBF7]/50 max-w-xl mx-auto">Three simple steps to save the world (or destroy it).</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <ShieldAlert className="w-10 h-10 text-[#CD302F]" />,
                                color: "bg-[#CD302F]/10",
                                title: "1. Join a Nation",
                                description: "Enter a game code to join a team. You'll be assigned a role like Minister of Defense or Economy."
                            },
                            {
                                icon: <PieChart className="w-10 h-10 text-[#D9AD1F]" />,
                                color: "bg-[#D9AD1F]/10",
                                title: "2. Manage Resources",
                                description: "Vote on how to allocate your limited budget. Every card played has immediate consequences."
                            },
                            {
                                icon: <Users className="w-10 h-10 text-[#4190A9]" />,
                                color: "bg-[#4190A9]/10",
                                title: "3. Respond to Crises",
                                description: "Real-time events will test your leadership. React quickly to spills, riots, and market crashes."
                            }
                        ].map((step, idx) => (
                            <div key={idx} className="group relative p-8 rounded-3xl bg-[#fff] dark:bg-[#3E3E3C] border border-[#333]/10 dark:border-[#FDFBF7]/10 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                                <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    {step.icon}
                                </div>
                                <h3 className="text-2xl font-bold font-serif italic text-[#333] dark:text-[#FDFBF7] mb-3">{step.title}</h3>
                                <p className="text-[#333]/70 dark:text-[#FDFBF7]/70 leading-relaxed font-sans">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>


                {/* Footer Branding */}
                <div className="w-full flex justify-between items-end px-4 md:px-12 mt-12 opacity-80 pointer-events-none sticky bottom-6">
                    <div className="hidden md:block">
                        <div className="flex items-center gap-1">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="transform rotate-90 text-[#333] dark:text-[#FDFBF7]">
                                <path d="M20.5 14.5L13.5 21.5C12.7 22.3 11.3 22.3 10.5 21.5L3.5 14.5C2 13 3 10.5 5 10.5H19C21 10.5 22 13 20.5 14.5Z" />
                            </svg>
                            <div className="font-black text-[#333] dark:text-[#FDFBF7] text-[0.65rem] leading-[0.85] flex flex-col tracking-tighter uppercase font-sans">
                                <span className="self-start">Doing</span>
                                <span className="self-end">More With</span>
                                <span className="self-end">Less</span>
                            </div>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="transform -rotate-90 text-[#333] dark:text-[#FDFBF7]">
                                <path d="M20.5 14.5L13.5 21.5C12.7 22.3 11.3 22.3 10.5 21.5L3.5 14.5C2 13 3 10.5 5 10.5H19C21 10.5 22 13 20.5 14.5Z" />
                            </svg>
                        </div>
                    </div>

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
                </div>

            </main>
        </div>
    );
}
