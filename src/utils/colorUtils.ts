export const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

export const getCategoryStyles = (category: { name: string; color?: string }) => {
    const defaultColor = '#6b7280';
    const hexColor = category?.color || defaultColor;
    const normalizedHex = hexColor.startsWith('#') ? hexColor : `#${hexColor}`;

    const rgb = hexToRgb(normalizedHex);
    if (!rgb) {
        return {
            accentStyle: { backgroundColor: defaultColor },
            borderStyle: { borderColor: defaultColor },
            bgStyle: { backgroundColor: `rgba(107, 114, 128, 0.1)` },
            textStyle: { color: defaultColor },
            shadowStyle: { boxShadow: `4px 4px 0px 0px rgba(107, 114, 128, 1)` }
        };
    }

    return {
        accentStyle: { backgroundColor: normalizedHex },
        borderStyle: { borderColor: normalizedHex },
        bgStyle: { backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` },
        textStyle: { color: normalizedHex },
        shadowStyle: { boxShadow: `4px 4px 0px 0px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` }
    };
};

export const formatEffect = (value: number) => value >= 0 ? `+${value}` : `${value}`;

export const getEffectColor = (value: number) => {
    if (value > 0) return 'text-green-600';
    if (value < 0) return 'text-red-600';
    return 'text-gray-600';
};
