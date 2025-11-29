import { useState, useEffect, useCallback } from 'react';
import { Category, CategoryFormState } from '../types/category';

interface ColorPreset {
    id: number;
    name: string;
    description?: string | null;
    backgroundColor: string;
    textColor: string;
    textBoxColor: string;
    isActive: boolean;
    isDefault: boolean;
    usageCount: number;
}

interface UseCategoryDataReturn {
    loading: boolean;
    error: string | null;
    category: Category | null;
    colors: ColorPreset[];
    initialFormData: CategoryFormState | null;
    refetch: () => Promise<void>;
}

export const useCategoryData = (
    categoryId: string | number
): UseCategoryDataReturn => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [category, setCategory] = useState<Category | null>(null);
    const [colors, setColors] = useState<ColorPreset[]>([]);
    const [initialFormData, setInitialFormData] = useState<CategoryFormState | null>(null);

    const transformCategoryToFormState = useCallback(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (category: any): CategoryFormState => ({
            name: typeof category.name === 'string' ? category.name : '',
            description: typeof category.description === 'string' ? category.description : '',
            color: typeof category.color === 'string' ? category.color : '#3B82F6',
            status:
                category.status === 'Active' || category.status === 'Inactive'
                    ? category.status
                    : 'Active',
        }),
        []
    );

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const [categoryRes, colorsRes] = await Promise.all([
                fetch(`/api/admin/categories/${categoryId}`),
                fetch('/api/admin/color-presets'),
            ]);

            if (!categoryRes.ok) {
                throw new Error(`Failed to fetch category: ${categoryRes.statusText}`);
            }

            if (!colorsRes.ok) {
                throw new Error(`Failed to fetch colors: ${colorsRes.statusText}`);
            }

            const [categoryData, colorsData] = await Promise.all([
                categoryRes.json(),
                colorsRes.json(),
            ]);


            // Set colors with proper validation
            setColors(Array.isArray(colorsData?.presets) ? colorsData.presets : []);

            // Set category and form data
            if (categoryData?.category) {
                setCategory(categoryData.category);
                setInitialFormData(transformCategoryToFormState(categoryData.category));
            } else {
                throw new Error('Category data not found in response');
            }
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            setError(errorMessage);
            setCategory(null);
            setInitialFormData(null);
        } finally {
            setLoading(false);
        }
    }, [categoryId, transformCategoryToFormState]);

    useEffect(() => {
        if (categoryId) {
            fetchData();
        }
    }, [categoryId, fetchData]);

    const refetch = useCallback(async () => {
        await fetchData();
    }, [fetchData]);

    return {
        loading,
        error,
        category,
        colors,
        initialFormData,
        refetch,
    };
};
