"use client"
import React, { useState } from 'react';
import { HelpCircle, Book, MessageCircle, ChevronDown, ChevronUp, FileText } from 'lucide-react';

const HelpPage = () => {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-black dark:text-white">Help & Documentation</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Guides, FAQs, and support for administrators.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Documentation Area */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Quick Start Guide */}
                    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Book className="text-blue-500" size={24} />
                            <h2 className="text-2xl font-bold text-black dark:text-white">Quick Start Guide</h2>
                        </div>
                        <div className="space-y-4 text-gray-700 dark:text-gray-300">
                            <p>
                                Welcome to the Crisis Card Game Admin Panel. Here you can manage every aspect of the game simulations.
                            </p>
                            <ol className="list-decimal list-inside space-y-2 ml-2">
                                <li><strong>Create Categories:</strong> Set up the crisis themes (e.g., Environmental, Economic).</li>
                                <li><strong>Create Cards:</strong> Add crisis scenarios with multiple response options.</li>
                                <li><strong>Set up a Game:</strong> Go to &apos;Games&apos; &gt; &apos;Create New&apos;, choose your settings, and launch.</li>
                                <li><strong>Lobby & Teams:</strong> Share the Game Code. Players join, and teams are assigned automatically or manually.</li>
                                <li><strong>Host Control:</strong> Use the &apos;Host View&apos; to manage the flow of the game, including phase transitions.</li>
                            </ol>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <HelpCircle className="text-purple-500" size={24} />
                            <h2 className="text-2xl font-bold text-black dark:text-white">Frequently Asked Questions</h2>
                        </div>
                        <div className="space-y-4">
                            <FaqItem
                                question="How do I delete a team safely?"
                                answer="Go to the specific Game details page. In the 'Teams' section, you can delete a team. If players are assigned to it, they will be automatically unassigned first."
                            />
                            <FaqItem
                                question="Can I edit a card while a game is active?"
                                answer="Yes, but changes will only apply to future games or if the game re-fetches the card data. It is recommended to pause the game or edit before starting."
                            />
                            <FaqItem
                                question="What happens if the host disconnects?"
                                answer="The game state is preserved on the server. The host can simply navigate back to the game management page and resume hosting."
                            />
                            <FaqItem
                                question="How are team scores calculated?"
                                answer="Team scores (Budget) start at a set amount. Each response to a crisis card has an associated cost or value that adds or subtracts from the team's budget."
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar / Support */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="text-green-500" size={24} />
                            <h2 className="text-xl font-bold text-black dark:text-white">Resources</h2>
                        </div>
                        <ul className="space-y-3">
                            <li>
                                <a href="#" className="flex items-center gap-2 text-blue-600 hover:underline">
                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                    <span>Game Rules PDF</span>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center gap-2 text-blue-600 hover:underline">
                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                    <span>Host Cheat Sheet</span>
                                </a>
                            </li>
                            <li>
                                <a href="#" className="flex items-center gap-2 text-blue-600 hover:underline">
                                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                                    <span>API Documentation</span>
                                </a>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-2">
                            <MessageCircle className="text-blue-500" size={20} />
                            <h3 className="font-bold text-blue-800 dark:text-blue-200">Need more help?</h3>
                        </div>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mb-4">
                            Contact the development team for technical support or bug reports.
                        </p>
                        <button className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
                            Contact Support
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FaqItem = ({ question, answer }: { question: string; answer: string }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
            >
                <span className="font-bold text-gray-800 dark:text-gray-200">{question}</span>
                {isOpen ? <ChevronUp size={20} className="text-gray-500" /> : <ChevronDown size={20} className="text-gray-500" />}
            </button>
            {isOpen && (
                <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {answer}
                </div>
            )}
        </div>
    );
}

export default HelpPage;
