import React from 'react';
import { Eye, Tag, Clock, Zap, Shield, TrendingUp, Building2, Leaf, Users } from 'lucide-react';
import { FormState, Category } from '../../types/crisisCard';
import { getCategoryStyles, formatEffect, getEffectColor } from '../../utils/colorUtils';

interface CardPreviewProps {
    formData: FormState;
    categories: Category[];
}

export const CardPreview: React.FC<CardPreviewProps> = ({ formData, categories }) => {
    const getCurrentCategory = () => {
        return categories.find(cat => cat.name === formData.categoryName);
    };

    const previewColors = (() => {
        const currentCategory = getCurrentCategory();
        if (currentCategory) {
            const styles = getCategoryStyles(currentCategory);
            return {
                accent: styles.accentStyle.backgroundColor,
                bg: styles.bgStyle.backgroundColor,
                text: styles.textStyle.color,
                shadow: styles.shadowStyle.boxShadow,
                border: styles.borderStyle.borderColor
            };
        }
        return {
            accent: '#6b7280',
            bg: 'rgba(107, 114, 128, 0.1)',
            text: '#6b7280',
            shadow: '4px 4px 0px 0px rgba(107, 114, 128, 1)',
            border: '#6b7280'
        };
    })();

    const visibleOptions = formData.responseOptions.filter(option => option.text.trim());

    return (
        <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sticky top-24">
            <div className="bg-gray-50 px-6 py-4 border-b-2 border-black">
                <div className="flex items-center gap-2">
                    <Eye size={18} className="text-black" />
                    <h2 className="text-lg font-bold text-black">Live Preview</h2>
                </div>
                <p className="text-sm text-gray-600 mt-1">How your crisis card will appear</p>
            </div>
            <div className="p-6">
                <div
                    className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 relative"
                    style={{ boxShadow: previewColors.shadow }}
                >
                    {formData.categoryName && (
                        <div
                            className="absolute top-0 left-0 w-full h-1 rounded-t-md"
                            style={{ backgroundColor: previewColors.accent }}
                        />
                    )}

                    <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                            {formData.title || 'Card Title'}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-semibold rounded border-2 ${formData.status === 'Active'
                            ? 'bg-green-100 text-green-800 border-green-800'
                            : 'bg-red-100 text-red-800 border-red-800'
                            }`}>
                            {formData.status}
                        </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {formData.description || 'Card description will appear here...'}
                    </p>

                    <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                            <Tag size={16} className="text-gray-500" />
                            <span
                                className="font-medium px-2 py-1 border-2 border-gray-200 rounded-full text-xs"
                                style={{
                                    backgroundColor: previewColors.bg,
                                    color: previewColors.text
                                }}
                            >
                                {formData.categoryName || 'Unknown'}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Clock size={16} className="text-gray-500" />
                            <span className="text-gray-700">{formData.timeLimit} minutes</span>
                        </div>
                    </div>



                    <div className="mb-4">
                        <p className="text-sm font-semibold mb-2 text-gray-700">Response Options:</p>
                        <div className="space-y-2">
                            {visibleOptions.length > 0 ? (
                                <>
                                    {visibleOptions.slice(0, 2).map((option, index) => (
                                        <div key={index} className="text-xs bg-gray-100 p-2 rounded border border-gray-300">
                                            <div className="text-gray-700 mb-1">{option.text}</div>
                                            <div className="flex gap-2 text-xs">
                                                {[
                                                    { label: 'POL', value: option.politicalEffect, icon: Shield },
                                                    { label: 'ECO', value: option.economicEffect, icon: TrendingUp },
                                                    { label: 'INF', value: option.infrastructureEffect, icon: Building2 },
                                                    { label: 'SOC', value: option.societyEffect, icon: Users },
                                                    { label: 'ENV', value: option.environmentEffect, icon: Leaf },
                                                ].map(({ label, value, icon: Icon }) => (
                                                    <span key={label} className={`flex items-center gap-1 font-medium ${getEffectColor(value)}`}>
                                                        <Icon size={10} />
                                                        {label}: {formatEffect(value)}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {visibleOptions.length > 2 && (
                                        <div className="text-xs text-gray-500">
                                            +{visibleOptions.length - 2} more options
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-200">
                                    No response options found for this card
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">
                        <div>Created: {new Date().toLocaleDateString()}</div>
                        <div>Updated: {new Date().toLocaleDateString()}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};
