"use client"
import React, { useState, useMemo } from 'react'
import { Search, AlertTriangle, Globe2, DollarSign, Zap, Users, Shield, Clock, X, Building, Heart, TrendingDown, Volume2, TreePine } from 'lucide-react'

const CrisisManagementPage = () => {
    const [searchTerm, setSearchTerm] = useState('')
    const [activeCategory, setActiveCategory] = useState('all')

    // Crisis scenario data with updated categories
    const crisisScenarios = [
        {
            id: 1,
            title: "Super Typhoon Hits the Coast",
            description: "A Category 5 typhoon makes landfall, destroying homes and displacing thousands. Emergency response systems are overwhelmed.",
            category: "environment",
            duration: "2 Mins",
            currentImpact: {
                pw: 0, ef: -3, ps: -1, gr: -2
            },
            responseOptions: [
                {
                    id: 'A',
                    text: "Deploy emergency relief & rebuild infrastructure",
                    impacts: { pw: 0, ef: -4, ps: +3, gr: +1 }
                },
                {
                    id: 'B',
                    text: "Relocate affected communities to safer areas",
                    impacts: { pw: 0, ef: -3, ps: 0, gr: +1 }
                },
                {
                    id: 'C',
                    text: "Delay response due to lack of funds",
                    impacts: { pw: -1, ef: 0, ps: -2, gr: 0 }
                }
            ]
        },
        {
            id: 2,
            title: "Misinformation Campaign Undermines Climate Action",
            description: "Fake news and misinformation reduce public trust in climate science and policies.",
            category: "political",
            duration: "4 Mins",
            currentImpact: {
                pw: -1, ef: 0, ps: -2, gr: 0
            },
            responseOptions: [
                {
                    id: 'A',
                    text: "Launch nationwide fact-checking & public awareness campaign",
                    impacts: { pw: +1, ef: -3, ps: +2, gr: 0 }
                },
                {
                    id: 'B',
                    text: "Engage influencers & media to counteract misinformation",
                    impacts: { pw: 0, ef: -2, ps: +1, gr: 0 }
                },
                {
                    id: 'C',
                    text: "Do nothing, allowing public skepticism to grow",
                    impacts: { pw: 0, ef: 0, ps: -2, gr: 0 }
                }
            ]
        },
        {
            id: 3,
            title: "Fossil Fuel Prices Skyrocket",
            description: "A global crisis leads to soaring oil and gas prices, straining national budgets.",
            category: "economic",
            duration: "5 Mins",
            currentImpact: {
                pw: 0, ef: -3, ps: -1, gr: 0
            },
            responseOptions: [
                {
                    id: 'A',
                    text: "Invest in renewable energy transition",
                    impacts: { pw: +1, ef: +1, ps: +2, gr: 0 }
                },
                {
                    id: 'B',
                    text: "Offer subsidies to lower fuel costs",
                    impacts: { pw: 0, ef: -2, ps: +1, gr: 0 }
                },
                {
                    id: 'C',
                    text: "Let the market stabilize naturally",
                    impacts: { pw: 0, ef: 0, ps: -2, gr: 0 }
                }
            ]
        },
        {
            id: 4,
            title: "Cyber Attack on Power Grid",
            description: "Hackers target the national electricity infrastructure, causing widespread blackouts and economic disruption.",
            category: "infrastructure",
            duration: "3 Mins",
            currentImpact: {
                pw: -2, ef: -4, ps: -1, gr: -1
            },
            responseOptions: [
                {
                    id: 'A',
                    text: "Activate backup systems & launch counter-offensive",
                    impacts: { pw: +1, ef: -2, ps: +2, gr: +1 }
                },
                {
                    id: 'B',
                    text: "Focus on manual restoration of critical services",
                    impacts: { pw: 0, ef: -1, ps: +1, gr: 0 }
                },
                {
                    id: 'C',
                    text: "Negotiate with attackers to minimize damage",
                    impacts: { pw: -1, ef: 0, ps: -1, gr: -1 }
                }
            ]
        },
        {
            id: 5,
            title: "Pandemic Overwhelms Healthcare System",
            description: "A new viral outbreak spreads rapidly, overwhelming hospitals and threatening public health infrastructure.",
            category: "society",
            duration: "6 Mins",
            currentImpact: {
                pw: -1, ef: -2, ps: -3, gr: -2
            },
            responseOptions: [
                {
                    id: 'A',
                    text: "Implement strict lockdown & expand hospital capacity",
                    impacts: { pw: 0, ef: -3, ps: +2, gr: -1 }
                },
                {
                    id: 'B',
                    text: "Focus on vaccination & testing programs",
                    impacts: { pw: +1, ef: -1, ps: +1, gr: 0 }
                },
                {
                    id: 'C',
                    text: "Maintain economy with minimal restrictions",
                    impacts: { pw: 0, ef: +1, ps: -2, gr: +1 }
                }
            ]
        },
        {
            id: 6,
            title: "Mass Migration Crisis",
            description: "Climate change forces millions to flee their homes, creating refugee camps and straining border resources.",
            category: "society",
            duration: "4 Mins",
            currentImpact: {
                pw: -1, ef: -1, ps: -2, gr: -1
            },
            responseOptions: [
                {
                    id: 'A',
                    text: "Establish humanitarian corridors & refugee support",
                    impacts: { pw: 0, ef: -2, ps: +3, gr: -1 }
                },
                {
                    id: 'B',
                    text: "Strengthen border security & screening processes",
                    impacts: { pw: +1, ef: -1, ps: +1, gr: 0 }
                },
                {
                    id: 'C',
                    text: "Close borders and redirect to other regions",
                    impacts: { pw: +1, ef: 0, ps: -1, gr: -1 }
                }
            ]
        }
    ]

    const categories = [
        { id: 'all', label: 'All Crises', icon: AlertTriangle },
        { id: 'political', label: 'Political', icon: Users },
        { id: 'society', label: 'Society', icon: Heart },
        { id: 'economic', label: 'Economic', icon: DollarSign },
        { id: 'infrastructure', label: 'Infrastructure', icon: Zap },
        { id: 'environment', label: 'Environment', icon: TreePine }
    ]

    const getCategoryColor = (category) => {
        const colors = {
            'political': 'bg-[#0072B2]',
            'society': 'bg-[#3FA1A8]',
            'economic': 'bg-[#E69F00]',
            'infrastructure': 'bg-[#D55E00]',
            'environment': 'bg-[#36A237]'
        }
        return colors[category] || 'bg-gray-400'
    }

    const getCategoryLabel = (category) => {
        const labels = {
            'political': 'Political',
            'society': 'Society',
            'economic': 'Economic',
            'infrastructure': 'Infrastructure',
            'environment': 'Environment'
        }
        return labels[category] || category
    }

    const getImpactIcon = (type) => {
        const icons = {
            pw: Building,
            ef: DollarSign,
            ps: Heart,
            gr: Volume2
        }
        return icons[type] || Building
    }

    const getImpactColor = (value) => {
        if (value > 0) return 'text-green-600'
        if (value < 0) return 'text-red-600'
        return 'text-gray-600'
    }

    const formatImpact = (value) => {
        if (value > 0) return `+${value}`
        return value.toString()
    }

    // Filter scenarios based on search and category
    const filteredScenarios = useMemo(() => {
        return crisisScenarios.filter(scenario => {
            const categoryMatch = activeCategory === 'all' || scenario.category === activeCategory
            const searchMatch = searchTerm === '' ||
                scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                scenario.description.toLowerCase().includes(searchTerm.toLowerCase())

            return categoryMatch && searchMatch
        })
    }, [searchTerm, activeCategory])

    return (
        <div className="min-h-screen bg-black p-2 sm:p-4 relative overflow-hidden">
            {/* Geometric Pattern Background - Hidden on mobile for performance */}
            <div className="absolute inset-0 opacity-10 pointer-events-none hidden sm:block">
                <div className="absolute top-10 left-10 w-20 h-20 border-4 border-white transform rotate-45"></div>
                <div className="absolute top-32 right-16 w-16 h-16 border-4 border-white transform rotate-12"></div>
                <div className="absolute bottom-20 left-20 w-24 h-24 border-4 border-white rounded-full"></div>
                <div className="absolute bottom-32 right-12 w-18 h-18 border-4 border-white transform -rotate-45"></div>
                <div className="absolute top-1/2 left-8 w-12 h-12 bg-white transform rotate-45"></div>
                <div className="absolute top-1/4 right-8 w-14 h-14 bg-white rounded-full"></div>
            </div>

            {/* Subtle Grid Pattern - Hidden on mobile */}
            <div
                className="absolute inset-0 opacity-5 pointer-events-none hidden sm:block"
                style={{
                    backgroundImage: `linear-gradient(white 1px, transparent 1px), linear-gradient(90deg, white 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }}
            />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-block p-4 sm:p-6 bg-white border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] sm:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] mb-4 sm:mb-6 relative">
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-2 h-2 sm:w-4 sm:h-4 bg-black transform rotate-45"></div>
                        <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-2 h-2 sm:w-4 sm:h-4 bg-black rounded-full"></div>
                        <AlertTriangle size={32} className="sm:hidden mx-auto text-black" />
                        <AlertTriangle size={48} className="hidden sm:block mx-auto text-black" />
                    </div>
                    <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white mb-2 sm:mb-4 transform -rotate-1 relative">
                        <span className="absolute -inset-1 bg-white transform -skew-x-12 -z-10"></span>
                        <span className="relative text-black px-2 sm:px-4">Crisis Response</span>
                    </h1>
                    <p className="text-base sm:text-xl font-bold text-gray-300">
                        Navigate through challenging scenarios!
                    </p>
                </div>

                {/* Controls */}
                <div className="bg-white border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] sm:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.8)] p-3 sm:p-6 mb-6 sm:mb-8 relative">
                    {/* Decorative Elements - Smaller on mobile */}
                    <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-3 h-3 sm:w-6 sm:h-6 bg-black transform rotate-45"></div>
                    <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-3 h-3 sm:w-6 sm:h-6 bg-black rounded-full"></div>
                    <div className="absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3 w-3 h-3 sm:w-6 sm:h-6 bg-black rounded-full"></div>
                    <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-3 h-3 sm:w-6 sm:h-6 bg-black transform rotate-45"></div>

                    {/* Search Bar */}
                    <div className="relative mb-4 sm:mb-6 transition-all duration-200 focus-within:translate-x-[1px] focus-within:translate-y-[1px] sm:focus-within:translate-x-[2px] sm:focus-within:translate-y-[2px]">
                        <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-600 z-10">
                            <Search size={16} className="sm:hidden" />
                            <Search size={20} className="hidden sm:block" />
                        </div>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 z-10"
                            >
                                <X size={16} className="sm:hidden" />
                                <X size={20} className="hidden sm:block" />
                            </button>
                        )}
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search crisis scenarios..."
                            className="w-full pl-10 pr-10 sm:pl-12 sm:pr-12 py-3 sm:py-4 border-2 sm:border-4 border-black rounded-lg font-semibold text-base sm:text-lg
                                bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                                transition-all duration-200 focus:outline-none placeholder-gray-500"
                        />
                    </div>

                    {/* Filter Buttons */}
                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
                        {categories.map((category) => {
                            const IconComponent = category.icon
                            const isActive = activeCategory === category.id

                            return (
                                <button
                                    key={category.id}
                                    onClick={() => setActiveCategory(category.id)}
                                    className={`px-2 py-2 sm:px-4 sm:py-3 border-2 sm:border-4 border-black rounded-lg font-bold text-xs sm:text-sm md:text-base
                                        transition-all duration-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                        hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                                        hover:translate-x-[1px] hover:translate-y-[1px] sm:hover:translate-x-[2px] sm:hover:translate-y-[2px]
                                        active:translate-x-[2px] active:translate-y-[2px] sm:active:translate-x-[4px] sm:active:translate-y-[4px] active:shadow-none
                                        flex items-center gap-1 sm:gap-2 relative overflow-hidden group
                                        ${isActive
                                            ? 'bg-black text-white'
                                            : 'bg-white text-black hover:bg-gray-100'
                                        }`}
                                >
                                    <div className={`absolute inset-0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500 opacity-20
                                        ${isActive ? 'bg-white' : 'bg-black'}`}></div>
                                    <IconComponent size={14} className="relative z-10 sm:size-4" />
                                    <span className="relative z-10 hidden sm:inline lg:inline">{category.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Results Count */}
                <div className="text-center mb-4 sm:mb-6">
                    <div className="inline-block bg-white px-3 py-1 sm:px-6 sm:py-2 border-2 sm:border-4 border-black transform -skew-x-12">
                        <p className="text-black font-bold text-sm sm:text-base transform skew-x-12">
                            Showing {filteredScenarios.length} of {crisisScenarios.length} crisis scenarios
                        </p>
                    </div>
                </div>

                {/* Cards Grid - Improved responsive layout */}
                {filteredScenarios.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6">
                        {filteredScenarios.map((scenario) => (
                            <div
                                key={scenario.id}
                                className="bg-gray-100 border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] sm:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.8)] overflow-hidden relative
                                    transition-all duration-300 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                    hover:translate-x-[2px] hover:translate-y-[2px] sm:hover:translate-x-[4px] sm:hover:translate-y-[4px] group"
                            >
                                {/* Category Header */}
                                <div className={`${getCategoryColor(scenario.category)} px-3 py-2 sm:px-4 sm:py-3 flex justify-between items-center`}>
                                    <span className="text-white font-bold text-xs sm:text-sm">
                                        {getCategoryLabel(scenario.category)}
                                    </span>
                                    <div className="flex items-center gap-1 sm:gap-2">
                                        <Clock size={14} className="text-white sm:size-4" />
                                        <span className="text-white font-bold text-xs sm:text-sm">{scenario.duration}</span>
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="p-4 sm:p-6 relative">
                                    {/* Title */}
                                    <h3 className="text-lg sm:text-xl font-black text-black mb-3 sm:mb-4 leading-tight">
                                        {scenario.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-gray-700 font-medium mb-4 sm:mb-5 text-sm sm:text-base leading-relaxed">
                                        {scenario.description}
                                    </p>

                                    {/* Current Impact - Fixed alignment */}
                                    <div className="grid grid-cols-4 gap-3 mb-5 sm:mb-6 p-3 bg-gray-50 rounded-xl border-2 border-gray-100">
                                        <div className="flex flex-col items-center">
                                            <Building size={16} className="text-gray-600 mb-2 sm:size-5" />
                                            <span className={`font-bold text-sm sm:text-base ${getImpactColor(scenario.currentImpact.pw)}`}>
                                                {formatImpact(scenario.currentImpact.pw)}
                                            </span>
                                            <span className="text-xs text-gray-500 font-bold mt-1">PW</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <DollarSign size={16} className="text-gray-600 mb-2 sm:size-5" />
                                            <span className={`font-bold text-sm sm:text-base ${getImpactColor(scenario.currentImpact.ef)}`}>
                                                {formatImpact(scenario.currentImpact.ef)}
                                            </span>
                                            <span className="text-xs text-gray-500 font-bold mt-1">EF</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <Heart size={16} className="text-gray-600 mb-2 sm:size-5" />
                                            <span className={`font-bold text-sm sm:text-base ${getImpactColor(scenario.currentImpact.ps)}`}>
                                                {formatImpact(scenario.currentImpact.ps)}
                                            </span>
                                            <span className="text-xs text-gray-500 font-bold mt-1">PS</span>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <Volume2 size={16} className="text-gray-600 mb-2 sm:size-5" />
                                            <span className={`font-bold text-sm sm:text-base ${getImpactColor(scenario.currentImpact.gr)}`}>
                                                {formatImpact(scenario.currentImpact.gr)}
                                            </span>
                                            <span className="text-xs text-gray-500 font-bold mt-1">GR</span>
                                        </div>
                                    </div>

                                    {/* Response Options Header */}
                                    <div className="border-t-2 border-gray-200 pt-4 sm:pt-5 mb-4 sm:mb-5">
                                        <h4 className="font-bold text-gray-800 mb-3 sm:mb-4 text-base sm:text-lg">Response Options</h4>
                                    </div>

                                    {/* Response Options - Fixed alignment */}
                                    <div className="space-y-4 sm:space-y-5">
                                        {scenario.responseOptions.map((option) => (
                                            <div key={option.id} className="border-2 border-gray-200 rounded-xl p-4 sm:p-5 hover:border-gray-400 transition-all duration-200 bg-gray-50 hover:bg-gray-100">
                                                <div className="flex items-start gap-3 sm:gap-4 mb-4">
                                                    <span className="flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 bg-black text-white text-sm sm:text-base font-bold rounded-full flex items-center justify-center">
                                                        {option.id}
                                                    </span>
                                                    <span className="text-sm sm:text-base font-medium text-gray-800 leading-relaxed">
                                                        {option.text}
                                                    </span>
                                                </div>
                                                {/* Impact grid - Better alignment */}
                                                <div className="grid grid-cols-4 gap-3 ml-10 sm:ml-12 bg-white p-3 rounded-lg border">
                                                    <div className="flex flex-col items-center py-1">
                                                        <Building size={12} className="text-gray-500 mb-1 sm:size-4" />
                                                        <span className={`font-bold text-xs sm:text-sm ${getImpactColor(option.impacts.pw)}`}>
                                                            {formatImpact(option.impacts.pw)}
                                                        </span>
                                                        <span className="text-xs text-gray-400 font-bold mt-0.5">PW</span>
                                                    </div>
                                                    <div className="flex flex-col items-center py-1">
                                                        <DollarSign size={12} className="text-gray-500 mb-1 sm:size-4" />
                                                        <span className={`font-bold text-xs sm:text-sm ${getImpactColor(option.impacts.ef)}`}>
                                                            {formatImpact(option.impacts.ef)}
                                                        </span>
                                                        <span className="text-xs text-gray-400 font-bold mt-0.5">EF</span>
                                                    </div>
                                                    <div className="flex flex-col items-center py-1">
                                                        <Heart size={12} className="text-gray-500 mb-1 sm:size-4" />
                                                        <span className={`font-bold text-xs sm:text-sm ${getImpactColor(option.impacts.ps)}`}>
                                                            {formatImpact(option.impacts.ps)}
                                                        </span>
                                                        <span className="text-xs text-gray-400 font-bold mt-0.5">PS</span>
                                                    </div>
                                                    <div className="flex flex-col items-center py-1">
                                                        <Volume2 size={12} className="text-gray-500 mb-1 sm:size-4" />
                                                        <span className={`font-bold text-xs sm:text-sm ${getImpactColor(option.impacts.gr)}`}>
                                                            {formatImpact(option.impacts.gr)}
                                                        </span>
                                                        <span className="text-xs text-gray-400 font-bold mt-0.5">GR</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 sm:py-16">
                        <div className="bg-white border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] sm:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.8)] p-6 sm:p-8 mx-auto max-w-md relative">
                            <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-3 h-3 sm:w-6 sm:h-6 bg-black transform rotate-45"></div>
                            <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-3 h-3 sm:w-6 sm:h-6 bg-black rounded-full"></div>
                            <div className="absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3 w-3 h-3 sm:w-6 sm:h-6 bg-black rounded-full"></div>
                            <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-3 h-3 sm:w-6 sm:h-6 bg-black transform rotate-45"></div>

                            <h3 className="text-xl sm:text-2xl font-black text-black mb-3 sm:mb-4">No Crisis Scenarios Found!</h3>
                            <p className="text-gray-700 font-semibold mb-4 sm:mb-6 text-sm sm:text-base">
                                Try adjusting your search or filter settings.
                            </p>
                            <button
                                onClick={() => {
                                    setSearchTerm('')
                                    setActiveCategory('all')
                                }}
                                className="px-4 py-2 sm:px-6 sm:py-3 border-2 sm:border-4 border-black rounded-lg font-bold bg-black text-white text-sm sm:text-base
                                    hover:bg-gray-900 transition-all duration-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                    hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                                    hover:translate-x-[1px] hover:translate-y-[1px] sm:hover:translate-x-[2px] sm:hover:translate-y-[2px]"
                            >
                                Reset Filters
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center mt-8 sm:mt-12">
                    <div className="inline-block bg-white px-4 py-2 sm:px-8 sm:py-3 border-2 sm:border-4 border-black transform -skew-x-12 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                        <p className="text-black font-black text-sm sm:text-lg transform skew-x-12">
                            Ready to tackle the next crisis? 🚨
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CrisisManagementPage
