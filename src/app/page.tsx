import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldAlert, Users, PieChart, Activity, Globe2, Trophy } from 'lucide-react';
import { cookies } from 'next/headers';

export default async function LandingPage() {
    const cookieStore = await cookies();
    const userRole = cookieStore.get("role")?.value;
    return (
        <div className="min-h-screen bg-[#FDFAE5] dark:bg-[#3E3E3C] flex flex-col relative font-sans transition-colors duration-300">
            {/* SVG Background — fades out after hero */}
            <div className="absolute inset-x-0 top-0 h-[110vh] overflow-hidden pointer-events-none z-0">
                {/* Light Mode */}
                <img
                    src="/svg/light/background.svg"
                    alt=""
                    className="w-full h-full object-cover dark:hidden"
                    aria-hidden="true"
                />
                {/* Dark Mode */}
                <img
                    src="/svg/dark/background.svg"
                    alt=""
                    className="w-full h-full object-cover hidden dark:block"
                    aria-hidden="true"
                />
                {/* Gradient fade to page background */}
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-[#FDFAE5] dark:to-[#3E3E3C]" />
            </div>

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

                {/* Top Right Navigation */}
                <div className="absolute top-6 right-6 z-50 flex gap-4 items-center hidden md:flex animate-in fade-in slide-in-from-top-4 duration-700">
                    <Link
                        href="/live"
                        className="font-bold font-sans text-[#333] dark:text-[#FDFBF7] text-lg hover:text-opacity-70 transition-colors"
                    >
                        Join a game
                    </Link>
                    {userRole ? (
                        <Link
                            href={userRole === 'ADMIN' ? "/admin/dashboard" : "/user/home"}
                            className="bg-white dark:bg-[#3E3E3C] border-2 border-[#333] dark:border-[#FDFBF7] text-[#333] dark:text-[#FDFBF7] px-6 py-2 rounded-lg font-bold font-sans hover:bg-[#333]/5 dark:hover:bg-[#FDFBF7]/10 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,1)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <Link
                            href="/auth/login"
                            className="bg-white dark:bg-[#3E3E3C] border-2 border-[#333] dark:border-[#FDFBF7] text-[#333] dark:text-[#FDFBF7] px-6 py-2 rounded-lg font-bold font-sans hover:bg-[#333]/5 dark:hover:bg-[#FDFBF7]/10 transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[5px_5px_0px_0px_rgba(255,255,255,1)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none"
                        >
                            Log in
                        </Link>
                    )}
                </div>

                {/* Top Logo */}
                {/* Top Logo */}
                <Link href="/" className="flex flex-col items-center gap-2 mb-12 z-10 animate-in fade-in slide-in-from-top-4 duration-700 hover:opacity-80 transition-opacity">
                    <h2 className="text-3xl md:text-4xl font-serif italic text-black/80 dark:text-[#FDFBF7]">Cards of Crisis</h2>
                    {/* 5 Color bar with border */}
                    <div className="flex -space-x-1.5 border-[3px] border-[#333] dark:border-[#FDFBF7] px-3 py-1.5 rounded-full bg-transparent items-center">
                        <div className="w-4 h-4 rounded-full bg-[#399B2C] border border-white/0 z-0"></div>
                        <div className="w-4 h-4 rounded-full bg-[#D9AD1F] border border-white/0 z-10"></div>
                        <div className="w-4 h-4 rounded-full bg-[#4190A9] border border-white/0 z-20"></div>
                        <div className="w-4 h-4 rounded-full bg-[#CA840C] border border-white/0 z-30"></div>
                        <div className="w-4 h-4 rounded-full bg-[#CD302F] border border-white/0 z-40"></div>
                    </div>
                </Link>

                {/* Main Hero */}
                <div className="relative z-10 w-full max-w-4xl text-center flex flex-col items-center justify-center mb-24 animate-in fade-in zoom-in duration-700">
                    <h1 className="text-6xl md:text-9xl font-serif italic text-black/90 dark:text-[#FDFBF7] mb-8 leading-[0.9] tracking-tight drop-shadow-sm">
                        Crisis <br /> Simulation
                    </h1>

                    <p className="text-xl md:text-2xl text-black/60 dark:text-[#FDFBF7]/60 max-w-2xl mb-12 font-medium leading-relaxed font-sans px-4">
                        Manage resources, make tough decisions, and lead your nation through global crises in this high-stakes simulation.
                    </p>

                    <div className="flex flex-col items-center justify-center p-4 w-full">
                        {!userRole ? (
                            <Link
                                href="/live"
                                className="group relative bg-[#333] dark:bg-[#FDFBF7] text-[#FDFBF7] dark:text-[#3E3E3C] text-3xl font-serif italic px-16 py-6 rounded-xl hover:bg-black dark:hover:bg-white transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none duration-200 w-full sm:w-auto text-center"
                            >
                                Join a game
                            </Link>
                        ) : (
                            <Link
                                href={userRole === 'ADMIN' ? "/admin/dashboard" : (process.env.NODE_ENV === 'production' ? "https://crisis-cards-game-live.vercel.app/" : "/live")}
                                className="group relative bg-[#333] dark:bg-[#FDFBF7] text-[#FDFBF7] dark:text-[#3E3E3C] text-3xl font-serif italic px-16 py-6 rounded-xl hover:bg-black dark:hover:bg-white transition-all shadow-[8px_8px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-none duration-200 w-full sm:w-auto text-center"
                            >
                                {userRole === 'ADMIN' ? "Admin Dashboard" : "Enter Simulation"}
                            </Link>
                        )}
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
                        <img src="/svg/light/dmwl-logo.svg" alt="Doing More With Less" className="h-10 w-auto dark:hidden" />
                        <img src="/svg/dark/dmwl-logo.svg" alt="Doing More With Less" className="h-10 w-auto hidden dark:block" />
                    </div>
                    <div className="hidden md:block">
                        <img src="/svg/light/combined-brand-logo.svg" alt="The Change Lab | Cards of Crisis" className="h-10 w-auto dark:hidden" />
                        <img src="/svg/dark/combined-brand-logo.svg" alt="The Change Lab | Cards of Crisis" className="h-10 w-auto hidden dark:block" />
                    </div>
                </div>

            </main>
        </div>
    );
}
