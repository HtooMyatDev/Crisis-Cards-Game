// Card theme utility for determining card colors based on category or stats

export interface CardTheme {
    isCustom: boolean;
    color: string;
    bgLight: string;
    text: string;
    border?: string;
}

interface ThemeStats {
    political: number;
    economic: number;
    infrastructure: number;
    society: number;
    environment: number;
}

interface ColorPreset {
    backgroundColor: string;
    textColor: string;
    textBoxColor: string;
}

/**
 * Determines the theme for a crisis card based on color preset, category color, or stats
 */
export function getCardTheme(
    stats: ThemeStats,
    categoryColor?: string,
    colorPreset?: ColorPreset
): CardTheme {
    // Priority 1: Use color preset if provided
    if (colorPreset) {
        return {
            isCustom: true,
            color: colorPreset.backgroundColor,
            bgLight: colorPreset.backgroundColor.startsWith('bg-')
                ? `${colorPreset.backgroundColor}/20`
                : `${colorPreset.backgroundColor}20`,
            text: colorPreset.textColor || 'text-gray-900'
        };
    }

    // Priority 2: Use category color if provided
    if (categoryColor) {
        return {
            isCustom: true,
            color: categoryColor,
            bgLight: categoryColor.startsWith('bg-')
                ? `${categoryColor}/20`
                : `${categoryColor}20`,
            text: 'text-gray-900'
        };
    }

    // Priority 3: Determine theme from highest stat value
    const statThemes = [
        { val: stats.political, color: 'bg-blue-500', border: 'border-blue-700', bgLight: 'bg-blue-50', text: 'text-blue-900' },
        { val: stats.economic, color: 'bg-yellow-500', border: 'border-yellow-700', bgLight: 'bg-yellow-50', text: 'text-yellow-900' },
        { val: stats.infrastructure, color: 'bg-gray-500', border: 'border-gray-700', bgLight: 'bg-gray-50', text: 'text-gray-900' },
        { val: stats.society, color: 'bg-purple-500', border: 'border-purple-700', bgLight: 'bg-purple-50', text: 'text-purple-900' },
        { val: stats.environment, color: 'bg-teal-500', border: 'border-teal-700', bgLight: 'bg-teal-50', text: 'text-teal-900' },
    ];

    const maxStat = statThemes.reduce((prev, current) => (prev.val > current.val) ? prev : current);

    // If all stats are 0, default to economic (yellow)
    if (maxStat.val === 0) {
        return { ...statThemes[1], isCustom: false };
    }

    return { ...maxStat, isCustom: false };
}
