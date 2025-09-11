"use client"
import React, { useState } from 'react';
import { Play, RotateCcw, Trophy, Clock, CheckCircle, XCircle } from 'lucide-react';

const UserGamePage = () => {
    const [gameStarted, setGameStarted] = useState(false);
    const [currentCard, setCurrentCard] = useState(0);
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);

    const crisisCards = [
        {
            id: 1,
            title: "Server Outage Crisis",
            description: "Your main production server has crashed during peak hours. Customer complaints are flooding in.",
            options: [
                { id: 'a', text: "Immediately restart the server", impact: "Quick fix but may cause data loss" },
                { id: 'b', text: "Investigate the root cause first", impact: "Takes longer but prevents future issues" },
                { id: 'c', text: "Switch to backup server", impact: "Minimal downtime but limited functionality" }
            ],
            correctAnswer: 'c'
        },
        {
            id: 2,
            title: "Security Breach Alert",
            description: "Your security team detected suspicious activity in your user database. Personal information may be compromised.",
            options: [
                { id: 'a', text: "Ignore the alert and continue normal operations", impact: "Risky - could lead to major breach" },
                { id: 'b', text: "Immediately lock down all systems", impact: "Safe but may cause business disruption" },
                { id: 'c', text: "Investigate while maintaining limited operations", impact: "Balanced approach with monitoring" }
            ],
            correctAnswer: 'b'
        },
        {
            id: 3,
            title: "Team Member Emergency",
            description: "Your lead developer had a family emergency and won't be available for the next 2 weeks during a critical project deadline.",
            options: [
                { id: 'a', text: "Ask them to work remotely from home", impact: "May not be feasible given the emergency" },
                { id: 'b', text: "Redistribute their tasks among the team", impact: "Good teamwork but may cause delays" },
                { id: 'c', text: "Hire a temporary contractor", impact: "Costly but maintains timeline" }
            ],
            correctAnswer: 'b'
        }
    ];

    const startGame = () => {
        setGameStarted(true);
        setCurrentCard(0);
        setScore(0);
        setTimeLeft(60);
    };

    const handleAnswer = (answerId: string) => {
        const card = crisisCards[currentCard];
        if (answerId === card.correctAnswer) {
            setScore(score + 10);
        }

        if (currentCard < crisisCards.length - 1) {
            setCurrentCard(currentCard + 1);
        } else {
            // Game finished
            setGameStarted(false);
        }
    };

    const resetGame = () => {
        setGameStarted(false);
        setCurrentCard(0);
        setScore(0);
        setTimeLeft(60);
    };

    if (!gameStarted) {
        return (
            <div className="p-6">
                <div className="max-w-2xl mx-auto">
                    {/* Game Header */}
                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-black text-black dark:text-white mb-4 transition-colors duration-200">
                            Crisis Card Game
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 font-medium transition-colors duration-200">
                            Test your decision-making skills in high-pressure scenarios
                        </p>
                    </div>

                    {/* Game Rules */}
                    <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg p-6
                        shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]
                        mb-8 transition-all duration-200">
                        <h2 className="text-xl font-bold text-black dark:text-white mb-4 transition-colors duration-200">
                            How to Play
                        </h2>
                        <ul className="space-y-2 text-gray-700 dark:text-gray-300 transition-colors duration-200">
                            <li className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-500 dark:text-green-400" />
                                Read each crisis scenario carefully
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-500 dark:text-green-400" />
                                Choose the best response from 3 options
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-500 dark:text-green-400" />
                                Earn points for correct decisions
                            </li>
                            <li className="flex items-center gap-2">
                                <CheckCircle size={16} className="text-green-500 dark:text-green-400" />
                                Complete all scenarios to finish
                            </li>
                        </ul>
                    </div>

                    {/* Start Game Button */}
                    <div className="text-center">
                        <button
                            onClick={startGame}
                            className="bg-green-600 dark:bg-green-700 border-4 border-black dark:border-gray-600 rounded-lg px-8 py-4 font-bold text-white text-xl
                                shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]
                                hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all duration-150
                                active:translate-x-[6px] active:translate-y-[6px] active:shadow-none"
                        >
                            <Play size={24} className="inline mr-2" />
                            Start Game
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const card = crisisCards[currentCard];
    const progress = ((currentCard + 1) / crisisCards.length) * 100;

    return (
        <div className="p-6">
            <div className="max-w-4xl mx-auto">
                {/* Game Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-lg px-4 py-2
                            shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                            transition-all duration-200">
                            <div className="flex items-center gap-2">
                                <Trophy size={20} className="text-yellow-500 dark:text-yellow-400" />
                                <span className="font-bold text-black dark:text-white transition-colors duration-200">
                                    Score: {score}
                                </span>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-lg px-4 py-2
                            shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                            transition-all duration-200">
                            <div className="flex items-center gap-2">
                                <Clock size={20} className="text-blue-500 dark:text-blue-400" />
                                <span className="font-bold text-black dark:text-white transition-colors duration-200">
                                    {timeLeft}s
                                </span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={resetGame}
                        className="bg-red-500 dark:bg-red-600 border-2 border-black dark:border-gray-600 rounded-lg px-4 py-2 font-bold text-white
                            shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                            hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150"
                    >
                        <RotateCcw size={16} className="inline mr-1" />
                        Reset
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="bg-gray-200 dark:bg-gray-700 border-2 border-black dark:border-gray-600 rounded-full h-4 overflow-hidden
                        transition-colors duration-200">
                        <div
                            className="bg-green-500 dark:bg-green-600 h-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <p className="text-center mt-2 font-semibold text-gray-600 dark:text-gray-300 transition-colors duration-200">
                        Card {currentCard + 1} of {crisisCards.length}
                    </p>
                </div>

                {/* Crisis Card */}
                <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg p-8
                    shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]
                    mb-8 transition-all duration-200">
                    <h2 className="text-2xl font-black text-black dark:text-white mb-4 transition-colors duration-200">
                        {card.title}
                    </h2>
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed transition-colors duration-200">
                        {card.description}
                    </p>

                    <div className="space-y-4">
                        {card.options.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => handleAnswer(option.id)}
                                className="w-full text-left p-4 border-2 border-black dark:border-gray-600 rounded-lg
                                    bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900
                                    shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                                    hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150
                                    active:translate-x-[3px] active:translate-y-[3px] active:shadow-none"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="w-8 h-8 bg-blue-500 dark:bg-blue-600 border-2 border-black dark:border-gray-600
                                        rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
                                        {option.id.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-bold text-black dark:text-white mb-1 transition-colors duration-200">
                                            {option.text}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200">
                                            {option.impact}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserGamePage;
