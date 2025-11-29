"use client"
import React, { useState } from 'react';
import {
    HelpCircle,
    Book,
    MessageCircle,
    Mail,
    ChevronDown,
    ChevronUp,
    Gamepad2,
    Users,
    Trophy,
    Target,
    Zap,
    Shield,
    AlertCircle,
    CheckCircle
} from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const HelpPage = () => {
    const [activeCategory, setActiveCategory] = useState<string>('getting-started');
    const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
    const [showChatModal, setShowChatModal] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [chatMessage, setChatMessage] = useState('');
    const [emailSubject, setEmailSubject] = useState('');
    const [emailMessage, setEmailMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    const categories = [
        { id: 'getting-started', label: 'Getting Started', icon: Book },
        { id: 'gameplay', label: 'Gameplay', icon: Gamepad2 },
        { id: 'scoring', label: 'Scoring & Winning', icon: Trophy },
        { id: 'troubleshooting', label: 'Troubleshooting', icon: AlertCircle }
    ];

    const faqs: FAQItem[] = [
        {
            category: 'getting-started',
            question: 'How do I join a game?',
            answer: 'To join a game, go to your dashboard and enter the game PIN provided by the host in the "Join Mission" section. Click ENTER and you\'ll be connected to the game lobby.'
        },
        {
            category: 'getting-started',
            question: 'What is a game PIN?',
            answer: 'A game PIN is a unique code (like ABC123) that identifies each game session. The host creates this code when setting up a game, and players use it to join.'
        },
        {
            category: 'getting-started',
            question: 'Do I need an account to play?',
            answer: 'While you can join games as a guest, creating an account allows you to track your statistics, earn achievements, and maintain your game history.'
        },
        {
            category: 'gameplay',
            question: 'How does the game work?',
            answer: 'Crisis Card Game is a collaborative decision-making game where players face various crisis scenarios. Each round presents a crisis card with multiple response options. Players discuss and vote on the best course of action.'
        },
        {
            category: 'gameplay',
            question: 'What are the different crisis categories?',
            answer: 'The game includes several crisis categories: Economic Crisis, Social Unrest, Natural Disaster, Political Crisis, Technological Failure, and Health Crisis. Each category presents unique challenges.'
        },
        {
            category: 'gameplay',
            question: 'How long does a typical game last?',
            answer: 'A typical game lasts between 30-60 minutes, depending on the number of cards selected and the pace of player discussions. The host can customize the game length when creating a session.'
        },
        {
            category: 'gameplay',
            question: 'Can I play with friends?',
            answer: 'Yes! Share the game PIN with your friends and they can join your session. The game supports 2-20 players per session.'
        },
        {
            category: 'scoring',
            question: 'How is scoring calculated?',
            answer: 'Points are awarded based on the effectiveness of your team\'s decisions. Better decisions that minimize negative impacts earn more points. Bonus points are awarded for quick decisions and unanimous votes.'
        },
        {
            category: 'scoring',
            question: 'What are achievements?',
            answer: 'Achievements are special badges earned by completing specific challenges, such as winning your first game, maintaining a win streak, or achieving perfect scores on scenarios.'
        },
        {
            category: 'scoring',
            question: 'How does the leaderboard work?',
            answer: 'The leaderboard ranks players based on their total score, win rate, and other performance metrics. It updates in real-time and resets monthly to give everyone a fresh start.'
        },
        {
            category: 'troubleshooting',
            question: 'The game PIN isn\'t working. What should I do?',
            answer: 'Make sure you\'re entering the PIN correctly (it\'s case-sensitive). If the issue persists, ask the host to verify the game is still active and hasn\'t started yet.'
        },
        {
            category: 'troubleshooting',
            question: 'I got disconnected from a game. Can I rejoin?',
            answer: 'Yes! Simply enter the same game PIN again from your dashboard. You\'ll be reconnected to the ongoing session with your previous progress intact.'
        },
        {
            category: 'troubleshooting',
            question: 'The page isn\'t loading properly. What can I do?',
            answer: 'Try refreshing the page or clearing your browser cache. Make sure you\'re using a modern browser (Chrome, Firefox, Safari, or Edge). If issues persist, contact support.'
        }
    ];

    const filteredFAQs = faqs.filter(faq => faq.category === activeCategory);

    const toggleFAQ = (index: number) => {
        setExpandedFAQ(expandedFAQ === index ? null : index);
    };

    const handleSendChat = async () => {
        if (!chatMessage.trim()) return;

        try {
            setSending(true);
            setErrorMessage('');
            const response = await fetch('/api/user/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'chat',
                    message: chatMessage
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message);
                setChatMessage('');
                setTimeout(() => {
                    setShowChatModal(false);
                    setSuccessMessage('');
                }, 2000);
            } else {
                setErrorMessage(data.error || 'Failed to send message');
            }
        } catch (error) {
            setErrorMessage('Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const handleSendEmail = async () => {
        if (!emailMessage.trim() || !emailSubject.trim()) return;

        try {
            setSending(true);
            setErrorMessage('');
            const response = await fetch('/api/user/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'email',
                    subject: emailSubject,
                    message: emailMessage
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage(data.message);
                setEmailSubject('');
                setEmailMessage('');
                setTimeout(() => {
                    setShowEmailModal(false);
                    setSuccessMessage('');
                }, 2000);
            } else {
                setErrorMessage(data.error || 'Failed to send email');
            }
        } catch (error) {
            setErrorMessage('Failed to send email. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const quickGuides = [
        {
            title: 'Quick Start Guide',
            icon: Zap,
            color: 'bg-yellow-500',
            steps: [
                'Enter a game PIN on your dashboard',
                'Wait for the host to start the game',
                'Read each crisis card carefully',
                'Discuss options with your team',
                'Vote on the best response',
                'See results and earn points!'
            ]
        },
        {
            title: 'Best Practices',
            icon: Target,
            color: 'bg-blue-500',
            steps: [
                'Communicate with your team',
                'Consider all perspectives',
                'Think about long-term impacts',
                'Don\'t rush your decisions',
                'Learn from each scenario',
                'Have fun and stay engaged!'
            ]
        }
    ];

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-black dark:text-white mb-2 tracking-tight">
                        HELP CENTER
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 font-bold">
                        Everything you need to know about Crisis Card Game
                    </p>
                </div>

                {/* Quick Guides */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {quickGuides.map((guide, idx) => (
                        <div
                            key={idx}
                            className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg p-6
                                shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]"
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className={`w-12 h-12 ${guide.color} border-2 border-black dark:border-gray-600 rounded-full flex items-center justify-center`}>
                                    <guide.icon size={24} className="text-white" />
                                </div>
                                <h2 className="text-xl font-black text-black dark:text-white">
                                    {guide.title}
                                </h2>
                            </div>
                            <ol className="space-y-2">
                                {guide.steps.map((step, stepIdx) => (
                                    <li key={stepIdx} className="flex items-start gap-3">
                                        <span className="flex-shrink-0 w-6 h-6 bg-black dark:bg-white text-white dark:text-black
                                            rounded-full flex items-center justify-center text-xs font-bold">
                                            {stepIdx + 1}
                                        </span>
                                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                                            {step}
                                        </span>
                                    </li>
                                ))}
                            </ol>
                        </div>
                    ))}
                </div>

                {/* FAQ Section */}
                <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg
                    shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] overflow-hidden">

                    {/* Category Tabs */}
                    <div className="border-b-4 border-black dark:border-gray-600 bg-gray-50 dark:bg-gray-900 p-4">
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={`flex items-center gap-2 px-4 py-2 border-2 border-black dark:border-gray-600 rounded-lg font-bold text-sm
                                        shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                                        hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150
                                        ${activeCategory === category.id
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white dark:bg-gray-700 text-black dark:text-white'
                                        }`}
                                >
                                    <category.icon size={16} />
                                    {category.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* FAQ List */}
                    <div className="p-6">
                        <div className="space-y-3">
                            {filteredFAQs.map((faq, index) => (
                                <div
                                    key={index}
                                    className="border-2 border-black dark:border-gray-600 rounded-lg overflow-hidden
                                        bg-gray-50 dark:bg-gray-700"
                                >
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full flex items-center justify-between p-4 text-left
                                            hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        <span className="font-bold text-black dark:text-white pr-4">
                                            {faq.question}
                                        </span>
                                        {expandedFAQ === index ? (
                                            <ChevronUp size={20} className="flex-shrink-0 text-black dark:text-white" />
                                        ) : (
                                            <ChevronDown size={20} className="flex-shrink-0 text-black dark:text-white" />
                                        )}
                                    </button>
                                    {expandedFAQ === index && (
                                        <div className="px-4 pb-4 pt-2 border-t-2 border-black dark:border-gray-600 bg-white dark:bg-gray-800">
                                            <p className="text-gray-700 dark:text-gray-300">
                                                {faq.answer}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Contact Support */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 border-4 border-black rounded-lg p-6
                        shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <MessageCircle size={32} />
                            <h3 className="text-2xl font-black">Live Chat</h3>
                        </div>
                        <p className="mb-4 text-blue-100">
                            Get instant help from our support team. Available 24/7.
                        </p>
                        <button
                            onClick={() => setShowChatModal(true)}
                            className="bg-white text-blue-600 font-bold px-6 py-3 rounded-lg border-2 border-black
                            shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                            hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150">
                            Start Chat
                        </button>
                    </div>

                    <div className="bg-gradient-to-br from-purple-600 to-purple-700 border-4 border-black rounded-lg p-6
                        shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-white">
                        <div className="flex items-center gap-3 mb-4">
                            <Mail size={32} />
                            <h3 className="text-2xl font-black">Email Support</h3>
                        </div>
                        <p className="mb-4 text-purple-100">
                            Send us a detailed message and we&apos;ll respond within 24 hours.
                        </p>
                        <button
                            onClick={() => setShowEmailModal(true)}
                            className="bg-white text-purple-600 font-bold px-6 py-3 rounded-lg border-2 border-black
                            shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                            hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150">
                            Send Email
                        </button>
                    </div>
                </div>

                {/* Game Tips */}
                <div className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20
                    border-4 border-black dark:border-gray-600 rounded-lg p-6
                    shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-green-500 border-2 border-black dark:border-gray-600 rounded-full
                            flex items-center justify-center flex-shrink-0">
                            <CheckCircle size={24} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-black dark:text-white mb-2">
                                Pro Tips for Success
                            </h3>
                            <ul className="space-y-2 text-gray-700 dark:text-gray-300">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 font-bold">•</span>
                                    <span>Take time to read each crisis card thoroughly before making decisions</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 font-bold">•</span>
                                    <span>Consider both short-term and long-term consequences of your choices</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 font-bold">•</span>
                                    <span>Collaborate with your team - diverse perspectives lead to better outcomes</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 font-bold">•</span>
                                    <span>Review your game history to learn from past decisions and improve</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Live Chat Modal */}
                {showChatModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg p-6 max-w-md w-full
                            shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
                            <h3 className="text-2xl font-black text-black dark:text-white mb-4">Live Chat Support</h3>

                            {successMessage ? (
                                <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-600 rounded-lg p-4 mb-4">
                                    <p className="text-green-700 dark:text-green-300 font-bold">{successMessage}</p>
                                </div>
                            ) : (
                                <>
                                    <textarea
                                        value={chatMessage}
                                        onChange={(e) => setChatMessage(e.target.value)}
                                        placeholder="Type your message here..."
                                        className="w-full p-3 border-2 border-black dark:border-gray-600 rounded-lg mb-4 h-32 resize-none
                                            bg-white dark:bg-gray-700 text-black dark:text-white
                                            focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        disabled={sending}
                                    />

                                    {errorMessage && (
                                        <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-600 rounded-lg p-3 mb-4">
                                            <p className="text-red-700 dark:text-red-300 font-bold text-sm">{errorMessage}</p>
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleSendChat}
                                            disabled={sending || !chatMessage.trim()}
                                            className="flex-1 bg-blue-600 text-white font-bold px-6 py-3 rounded-lg border-2 border-black
                                                shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                                                hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150
                                                disabled:opacity-50 disabled:cursor-not-allowed">
                                            {sending ? 'Sending...' : 'Send Message'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowChatModal(false);
                                                setChatMessage('');
                                                setErrorMessage('');
                                            }}
                                            disabled={sending}
                                            className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-bold px-6 py-3 rounded-lg border-2 border-black dark:border-gray-600
                                                shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none
                                                hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150">
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Email Modal */}
                {showEmailModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg p-6 max-w-md w-full
                            shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]">
                            <h3 className="text-2xl font-black text-black dark:text-white mb-4">Email Support</h3>

                            {successMessage ? (
                                <div className="bg-green-100 dark:bg-green-900/30 border-2 border-green-600 rounded-lg p-4 mb-4">
                                    <p className="text-green-700 dark:text-green-300 font-bold">{successMessage}</p>
                                </div>
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        value={emailSubject}
                                        onChange={(e) => setEmailSubject(e.target.value)}
                                        placeholder="Subject"
                                        className="w-full p-3 border-2 border-black dark:border-gray-600 rounded-lg mb-4
                                            bg-white dark:bg-gray-700 text-black dark:text-white
                                            focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        disabled={sending}
                                    />

                                    <textarea
                                        value={emailMessage}
                                        onChange={(e) => setEmailMessage(e.target.value)}
                                        placeholder="Type your message here..."
                                        className="w-full p-3 border-2 border-black dark:border-gray-600 rounded-lg mb-4 h-32 resize-none
                                            bg-white dark:bg-gray-700 text-black dark:text-white
                                            focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        disabled={sending}
                                    />

                                    {errorMessage && (
                                        <div className="bg-red-100 dark:bg-red-900/30 border-2 border-red-600 rounded-lg p-3 mb-4">
                                            <p className="text-red-700 dark:text-red-300 font-bold text-sm">{errorMessage}</p>
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={handleSendEmail}
                                            disabled={sending || !emailMessage.trim() || !emailSubject.trim()}
                                            className="flex-1 bg-purple-600 text-white font-bold px-6 py-3 rounded-lg border-2 border-black
                                                shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                                                hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150
                                                disabled:opacity-50 disabled:cursor-not-allowed">
                                            {sending ? 'Sending...' : 'Send Email'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowEmailModal(false);
                                                setEmailSubject('');
                                                setEmailMessage('');
                                                setErrorMessage('');
                                            }}
                                            disabled={sending}
                                            className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white font-bold px-6 py-3 rounded-lg border-2 border-black dark:border-gray-600
                                                shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none
                                                hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150">
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default HelpPage;
