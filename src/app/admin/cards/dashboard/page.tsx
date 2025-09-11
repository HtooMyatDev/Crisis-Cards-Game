"use client"
import React, { useState } from 'react'
import { BarChart3, PieChart, TrendingUp, AlertTriangle, Clock, Users, DollarSign, Building, Heart, Volume2, TreePine, Zap, Eye, Filter, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'

const CardsOverview = () => {
    const [selectedTimeframe, setSelectedTimeframe] = useState('all')

    // Crisis scenario data (same as main page)
    const crisisScenarios = [
        {
            id: 1,
            title: "Super Typhoon Hits the Coast",
            category: "environment",
            duration: "2 Mins",
            severity: "high",
            currentImpact: { pw: 0, ef: -3, ps: -1, gr: -2 }
        },
        {
            id: 2,
            title: "Misinformation Campaign Undermines Climate Action",
            category: "political",
            duration: "4 Mins",
            severity: "medium",
            currentImpact: { pw: -1, ef: 0, ps: -2, gr: 0 }
        },
        {
            id: 3,
            title: "Fossil Fuel Prices Skyrocket",
            category: "economic",
            duration: "5 Mins",
            severity: "high",
            currentImpact: { pw: 0, ef: -3, ps: -1, gr: 0 }
        },
        {
            id: 4,
            title: "Cyber Attack on Power Grid",
            category: "infrastructure",
            duration: "3 Mins",
            severity: "critical",
            currentImpact: { pw: -2, ef: -4, ps: -1, gr: -1 }
        },
        {
            id: 5,
            title: "Pandemic Overwhelms Healthcare System",
            category: "society",
            duration: "6 Mins",
            severity: "critical",
            currentImpact: { pw: -1, ef: -2, ps: -3, gr: -2 }
        },
        {
            id: 6,
            title: "Mass Migration Crisis",
            category: "society",
            duration: "4 Mins",
            severity: "high",
            currentImpact: { pw: -1, ef: -1, ps: -2, gr: -1 }
        }
    ]

    const categories = [
        { id: 'political', label: 'Political', icon: Users, color: '#0072B2', count: 1 },
        { id: 'society', label: 'Society', icon: Heart, color: '#3FA1A8', count: 2 },
        { id: 'economic', label: 'Economic', icon: DollarSign, color: '#E69F00', count: 1 },
        { id: 'infrastructure', label: 'Infrastructure', icon: Zap, color: '#D55E00', count: 1 },
        { id: 'environment', label: 'Environment', icon: TreePine, color: '#36A237', count: 1 }
    ]

    const getSeverityColor = (severity) => {
        const colors = {
            'low': 'bg-green-500',
            'medium': 'bg-yellow-500',
            'high': 'bg-orange-500',
            'critical': 'bg-red-500'
        }
        return colors[severity] || 'bg-gray-500'
    }

    const getSeverityCount = (severity) => {
        return crisisScenarios.filter(scenario => scenario.severity === severity).length
    }

    const getAverageImpact = (metric) => {
        const total = crisisScenarios.reduce((sum, scenario) => sum + scenario.currentImpact[metric], 0)
        return (total / crisisScenarios.length).toFixed(1)
    }

    const getImpactTrend = (value) => {
        const numValue = parseFloat(value)
        if (numValue > 0) return { icon: ArrowUpRight, color: 'text-green-600' }
        if (numValue < 0) return { icon: ArrowDownRight, color: 'text-red-600' }
        return { icon: Minus, color: 'text-gray-600' }
    }

    const totalScenarios = crisisScenarios.length
    const averageDuration = Math.round(
        crisisScenarios.reduce((sum, scenario) => {
            return sum + parseInt(scenario.duration.match(/\d+/)[0])
        }, 0) / totalScenarios
    )

    return (
        <div className="min-h-screen bg-black p-2 sm:p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-10 pointer-events-none hidden sm:block">
                <div className="absolute top-16 left-16 w-24 h-24 border-4 border-white transform rotate-45"></div>
                <div className="absolute top-40 right-20 w-20 h-20 border-4 border-white transform rotate-12"></div>
                <div className="absolute bottom-24 left-24 w-28 h-28 border-4 border-white rounded-full"></div>
                <div className="absolute bottom-40 right-16 w-22 h-22 border-4 border-white transform -rotate-45"></div>
                <div className="absolute top-1/2 left-12 w-16 h-16 bg-white transform rotate-45"></div>
                <div className="absolute top-1/3 right-12 w-18 h-18 bg-white rounded-full"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <div className="inline-block p-4 sm:p-6 bg-white border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] sm:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] mb-4 sm:mb-6 relative">
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-2 h-2 sm:w-4 sm:h-4 bg-black transform rotate-45"></div>
                        <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-2 h-2 sm:w-4 sm:h-4 bg-black rounded-full"></div>
                        <BarChart3 size={32} className="sm:hidden mx-auto text-black" />
                        <BarChart3 size={48} className="hidden sm:block mx-auto text-black" />
                    </div>
                    <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-white mb-2 sm:mb-4 transform -rotate-1 relative">
                        <span className="absolute -inset-1 bg-white transform -skew-x-12 -z-10"></span>
                        <span className="relative text-black px-2 sm:px-4">Cards Overview</span>
                    </h1>
                    <p className="text-base sm:text-xl font-bold text-gray-300">
                        Comprehensive analysis of all crisis scenarios
                    </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                    {/* Total Scenarios */}
                    <div className="bg-white border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] sm:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.8)] p-4 sm:p-6 relative group hover:translate-x-[2px] hover:translate-y-[2px] sm:hover:translate-x-[4px] sm:hover:translate-y-[4px] transition-all duration-300">
                        <div className="absolute -top-1 -left-1 sm:-top-2 sm:-left-2 w-2 h-2 sm:w-4 sm:h-4 bg-black transform rotate-45"></div>
                        <AlertTriangle size={24} className="text-black mb-2 sm:mb-3 sm:size-8" />
                        <div className="text-2xl sm:text-4xl font-black text-black mb-1">{totalScenarios}</div>
                        <div className="text-sm sm:text-base font-bold text-gray-600">Total Scenarios</div>
                    </div>

                    {/* Average Duration */}
                    <div className="bg-white border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] sm:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.8)] p-4 sm:p-6 relative group hover:translate-x-[2px] hover:translate-y-[2px] sm:hover:translate-x-[4px] sm:hover:translate-y-[4px] transition-all duration-300">
                        <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-2 h-2 sm:w-4 sm:h-4 bg-black rounded-full"></div>
                        <Clock size={24} className="text-black mb-2 sm:mb-3 sm:size-8" />
                        <div className="text-2xl sm:text-4xl font-black text-black mb-1">{averageDuration}m</div>
                        <div className="text-sm sm:text-base font-bold text-gray-600">Avg Duration</div>
                    </div>

                    {/* Critical Scenarios */}
                    <div className="bg-white border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] sm:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.8)] p-4 sm:p-6 relative group hover:translate-x-[2px] hover:translate-y-[2px] sm:hover:translate-x-[4px] sm:hover:translate-y-[4px] transition-all duration-300">
                        <div className="absolute -bottom-1 -left-1 sm:-bottom-2 sm:-left-2 w-2 h-2 sm:w-4 sm:h-4 bg-black rounded-full"></div>
                        <div className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full mb-2 sm:mb-3"></div>
                        <div className="text-2xl sm:text-4xl font-black text-red-600 mb-1">{getSeverityCount('critical')}</div>
                        <div className="text-sm sm:text-base font-bold text-gray-600">Critical Level</div>
                    </div>

                    {/* Categories */}
                    <div className="bg-white border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] sm:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.8)] p-4 sm:p-6 relative group hover:translate-x-[2px] hover:translate-y-[2px] sm:hover:translate-x-[4px] sm:hover:translate-y-[4px] transition-all duration-300">
                        <div className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-2 h-2 sm:w-4 sm:h-4 bg-black transform rotate-45"></div>
                        <Filter size={24} className="text-black mb-2 sm:mb-3 sm:size-8" />
                        <div className="text-2xl sm:text-4xl font-black text-black mb-1">{categories.length}</div>
                        <div className="text-sm sm:text-base font-bold text-gray-600">Categories</div>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-6 sm:mb-8">
                    {/* Category Breakdown */}
                    <div className="lg:col-span-2 bg-white border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] sm:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.8)] p-4 sm:p-6 relative">
                        <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-3 h-3 sm:w-6 sm:h-6 bg-black transform rotate-45"></div>
                        <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-3 h-3 sm:w-6 sm:h-6 bg-black rounded-full"></div>

                        <h2 className="text-xl sm:text-2xl font-black text-black mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                            <PieChart size={24} className="sm:size-8" />
                            Category Distribution
                        </h2>

                        <div className="space-y-3 sm:space-y-4">
                            {categories.map((category) => {
                                const IconComponent = category.icon
                                const percentage = ((category.count / totalScenarios) * 100).toFixed(0)

                                return (
                                    <div key={category.id} className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-xl border-2 border-gray-100 hover:border-gray-300 transition-all duration-200">
                                        <div
                                            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-white"
                                            style={{ backgroundColor: category.color }}
                                        >
                                            <IconComponent size={20} className="sm:size-6" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-bold text-sm sm:text-base text-gray-800">{category.label}</div>
                                            <div className="text-xs sm:text-sm text-gray-600">{category.count} scenario{category.count !== 1 ? 's' : ''}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-lg sm:text-xl font-black text-black">{percentage}%</div>
                                            <div className="w-12 sm:w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full transition-all duration-500"
                                                    style={{
                                                        width: `${percentage}%`,
                                                        backgroundColor: category.color
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Impact Analysis */}
                    <div className="bg-white border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] sm:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.8)] p-4 sm:p-6 relative">
                        <div className="absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3 w-3 h-3 sm:w-6 sm:h-6 bg-black rounded-full"></div>
                        <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-3 h-3 sm:w-6 sm:h-6 bg-black transform rotate-45"></div>

                        <h2 className="text-xl sm:text-2xl font-black text-black mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                            <TrendingUp size={24} className="sm:size-8" />
                            Impact Analysis
                        </h2>

                        <div className="space-y-4 sm:space-y-6">
                            {[
                                { key: 'pw', label: 'Political Will', icon: Building },
                                { key: 'ef', label: 'Economic Factor', icon: DollarSign },
                                { key: 'ps', label: 'Public Support', icon: Heart },
                                { key: 'gr', label: 'Global Reputation', icon: Volume2 }
                            ].map((metric) => {
                                const IconComponent = metric.icon
                                const avgValue = getAverageImpact(metric.key)
                                const trend = getImpactTrend(avgValue)
                                const TrendIcon = trend.icon

                                return (
                                    <div key={metric.key} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-xl border-2 border-gray-100">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <IconComponent size={20} className="text-gray-600 sm:size-6" />
                                            <div>
                                                <div className="font-bold text-sm sm:text-base text-gray-800">{metric.label}</div>
                                                <div className="text-xs sm:text-sm text-gray-600">Average Impact</div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 sm:gap-2">
                                            <TrendIcon size={16} className={`${trend.color} sm:size-5`} />
                                            <span className={`font-bold text-lg sm:text-xl ${trend.color}`}>
                                                {avgValue > 0 ? '+' : ''}{avgValue}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Severity Distribution */}
                <div className="bg-white border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] sm:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.8)] p-4 sm:p-6 mb-6 sm:mb-8 relative">
                    <div className="absolute -top-2 -left-2 sm:-top-3 sm:-left-3 w-3 h-3 sm:w-6 sm:h-6 bg-black transform rotate-45"></div>
                    <div className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 w-3 h-3 sm:w-6 sm:h-6 bg-black rounded-full"></div>
                    <div className="absolute -bottom-2 -left-2 sm:-bottom-3 sm:-left-3 w-3 h-3 sm:w-6 sm:h-6 bg-black rounded-full"></div>
                    <div className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 w-3 h-3 sm:w-6 sm:h-6 bg-black transform rotate-45"></div>

                    <h2 className="text-xl sm:text-2xl font-black text-black mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                        <AlertTriangle size={24} className="sm:size-8" />
                        Severity Distribution
                    </h2>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {['low', 'medium', 'high', 'critical'].map((severity) => {
                            const count = getSeverityCount(severity)
                            const percentage = ((count / totalScenarios) * 100).toFixed(0)

                            return (
                                <div key={severity} className="text-center p-4 sm:p-6 bg-gray-50 rounded-xl border-2 border-gray-100 hover:border-gray-300 transition-all duration-200">
                                    <div className={`w-12 h-12 sm:w-16 sm:h-16 ${getSeverityColor(severity)} rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center text-white font-bold text-lg sm:text-xl`}>
                                        {count}
                                    </div>
                                    <div className="font-bold text-sm sm:text-base text-gray-800 capitalize mb-1">{severity}</div>
                                    <div className="text-xs sm:text-sm text-gray-600">{percentage}% of scenarios</div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Quick Access Actions */}
                <div className="bg-white border-2 sm:border-4 border-black rounded-xl sm:rounded-2xl shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)] sm:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.8)] p-4 sm:p-6 relative">
                    <h2 className="text-xl sm:text-2xl font-black text-black mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                        <Eye size={24} className="sm:size-8" />
                        Quick Actions
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                        <button className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-2 sm:border-4 border-black rounded-lg font-bold text-sm sm:text-base bg-white hover:bg-gray-100 transition-all duration-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] sm:hover:translate-x-[2px] sm:hover:translate-y-[2px]">
                            <AlertTriangle size={20} className="sm:size-6" />
                            <span>View All Scenarios</span>
                        </button>

                        <button className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-2 sm:border-4 border-black rounded-lg font-bold text-sm sm:text-base bg-white hover:bg-gray-100 transition-all duration-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] sm:hover:translate-x-[2px] sm:hover:translate-y-[2px]">
                            <Filter size={20} className="sm:size-6" />
                            <span>Filter by Category</span>
                        </button>

                        <button className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-2 sm:border-4 border-black rounded-lg font-bold text-sm sm:text-base bg-white hover:bg-gray-100 transition-all duration-200 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] sm:hover:translate-x-[2px] sm:hover:translate-y-[2px]">
                            <BarChart3 size={20} className="sm:size-6" />
                            <span>Detailed Analytics</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 sm:mt-12">
                    <div className="inline-block bg-white px-4 py-2 sm:px-8 sm:py-3 border-2 sm:border-4 border-black transform -skew-x-12 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                        <p className="text-black font-black text-sm sm:text-lg transform skew-x-12">
                            Ready to dive into crisis management? 📊
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CardsOverview
