import { useState, useEffect } from 'react';
import { Category, FormState } from '../types/crisisCard';

export const useCrisisCardData = (cardId: string) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [initialFormData, setInitialFormData] = useState<FormState | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [categoriesRes, cardRes] = await Promise.all([
                    fetch('/api/admin/categories'),
                    fetch(`/api/admin/cards/${cardId}`)
                ]);

                const categoriesData = await categoriesRes.json();
                const cardData = await cardRes.json();

                setCategories(Array.isArray(categoriesData?.categories) ? categoriesData.categories : []);

                if (cardData?.card) {
                    setInitialFormData(transformCardDataToFormState(cardData.card));
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [cardId]);

    const transformCardDataToFormState = (card: any): FormState => ({
        title: card.title || '',
        description: card.description || '',
        categoryId: typeof card.categoryId === 'number' ? card.categoryId : '',
        categoryName: card.category?.name || '',
        status: card.status || 'Active',
        timeLimit: typeof card.timeLimit === 'number' ? card.timeLimit : 15,
        pwValue: typeof card.pwValue === 'number' ? card.pwValue : 0,
        efValue: typeof card.efValue === 'number' ? card.efValue : 0,
        psValue: typeof card.psValue === 'number' ? card.psValue : 0,
        grValue: typeof card.grValue === 'number' ? card.grValue : 0,
        responseOptions: Array.isArray(card.cardResponses) && card.cardResponses.length > 0
            ? card.cardResponses.map((r: any) => ({
                text: typeof r.text === 'string' ? r.text : '',
                pwEffect: typeof r.pwEffect === 'number' ? r.pwEffect : 0,
                efEffect: typeof r.efEffect === 'number' ? r.efEffect : 0,
                psEffect: typeof r.psEffect === 'number' ? r.psEffect : 0,
                grEffect: typeof r.grEffect === 'number' ? r.grEffect : 0,
            }))
            : [{ text: '', pwEffect: 0, efEffect: 0, psEffect: 0, grEffect: 0 }]
    });

    return { loading, error, categories, initialFormData };
};
