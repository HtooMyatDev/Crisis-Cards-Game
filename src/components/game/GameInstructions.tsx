import React from 'react';
import { X, BookOpen, Users, Clock, TrendingUp, Shield, Building2, Leaf } from 'lucide-react';

interface GameInstructionsProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GameInstructions: React.FC<GameInstructionsProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-black relative">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b-4 border-black p-4 sm:p-6 flex justify-between items-center z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-yellow-400 p-2 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <BookOpen size={24} className="text-black" />
                        </div>
                        <h2 className="text-2xl font-black text-black uppercase tracking-tight">How to Play</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors border-2 border-transparent hover:border-black"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                    {/* Section 1: Objective */}
                    <section>
                        <h3 className="text-xl font-black text-black mb-4 flex items-center gap-2">
                            <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                            OBJECTIVE
                        </h3>
                        <p className="text-gray-700 font-medium leading-relaxed bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                            Work together with your team to solve global crises. Your goal is to maintain high scores across all categories while managing your budget. The team with the highest score at the end wins!
                        </p>
                    </section>

                    {/* Section 2: Roles */}
                    <section>
                        <h3 className="text-xl font-black text-black mb-4 flex items-center gap-2">
                            <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                            ROLES & TURNS
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                                <div className="flex items-center gap-2 mb-2 text-blue-800 font-bold">
                                    <Users size={20} />
                                    LEADER
                                </div>
                                <p className="text-sm text-blue-900">
                                    One player is the Leader each round. They make the final decision on which response to choose.
                                </p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                                <div className="flex items-center gap-2 mb-2 text-purple-800 font-bold">
                                    <Users size={20} />
                                    TEAM
                                </div>
                                <p className="text-sm text-purple-900">
                                    Other players discuss and vote to advise the Leader. Your votes help guide the decision!
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Resources */}
                    <section>
                        <h3 className="text-xl font-black text-black mb-4 flex items-center gap-2">
                            <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">3</span>
                            RESOURCES
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {[
                                { label: 'Political', icon: Shield, color: 'text-blue-600', bg: 'bg-blue-50' },
                                { label: 'Economic', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
                                { label: 'Social', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
                                { label: 'Infrastructure', icon: Building2, color: 'text-gray-600', bg: 'bg-gray-50' },
                                { label: 'Environment', icon: Leaf, color: 'text-teal-600', bg: 'bg-teal-50' },
                            ].map((item, i) => (
                                <div key={i} className={`${item.bg} p-3 rounded-lg border border-gray-200 flex items-center gap-2`}>
                                    <item.icon size={16} className={item.color} />
                                    <span className="font-bold text-gray-700 text-sm">{item.label}</span>
                                </div>
                            ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2 italic">
                            *Watch out! Responses affect these values differently.
                        </p>
                    </section>

                    {/* Section 4: Time */}
                    <section>
                        <h3 className="text-xl font-black text-black mb-4 flex items-center gap-2">
                            <span className="bg-black text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">4</span>
                            TIME LIMIT
                        </h3>
                        <div className="flex items-center gap-4 bg-red-50 p-4 rounded-xl border-2 border-red-200">
                            <div className="bg-red-100 p-3 rounded-full">
                                <Clock size={24} className="text-red-600" />
                            </div>
                            <div>
                                <p className="text-red-900 font-bold">The Clock is Ticking!</p>
                                <p className="text-sm text-red-800">
                                    You have limited time to make a decision. If time runs out, a random choice might be made!
                                </p>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t-4 border-black p-6 flex justify-end rounded-b-xl">
                    <button
                        onClick={onClose}
                        className="bg-black text-white px-6 py-3 rounded-xl font-black text-base sm:text-lg hover:bg-gray-800 transition-transform hover:scale-105 active:scale-95 shadow-lg"
                    >
                        GOT IT, LET&apos;S PLAY!
                    </button>
                </div>
            </div>
        </div>
    );
};
