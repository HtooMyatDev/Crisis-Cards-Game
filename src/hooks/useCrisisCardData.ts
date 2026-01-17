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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const transformCardDataToFormState = (card: any): FormState => ({
        title: card.title || '',
        description: card.description || '',
        categoryId: typeof card.categoryId === 'number' ? card.categoryId : '',
        categoryName: card.category?.name || '',
        status: (card.status === 'OPEN' || card.status === 'IN_PROGRESS') ? 'Active' : 'Inactive',
        timeLimit: typeof card.timeLimit === 'number' ? card.timeLimit : 15,
        responseOptions: Array.isArray(card.cardResponses) && card.cardResponses.length > 0
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ? card.cardResponses.map((r: any) => ({
                text: typeof r.text === 'string' ? r.text : '',
                politicalEffect: typeof r.politicalEffect === 'number' ? r.politicalEffect : 0,
                economicEffect: typeof r.economicEffect === 'number' ? r.economicEffect : 0,
                infrastructureEffect: typeof r.infrastructureEffect === 'number' ? r.infrastructureEffect : 0,
                societyEffect: typeof r.societyEffect === 'number' ? r.societyEffect : 0,
                environmentEffect: typeof r.environmentEffect === 'number' ? r.environmentEffect : 0,
                score: typeof r.score === 'number' ? r.score : 0,
                // Ensure cost is mapped if present in backend, defaulting to 0
                cost: typeof r.cost === 'number' ? r.cost : 0,
                impactDescription: typeof r.impactDescription === 'string' ? r.impactDescription : ''
            }))
            : [{ text: '', politicalEffect: 0, economicEffect: 0, infrastructureEffect: 0, societyEffect: 0, environmentEffect: 0, score: 0, cost: 0, impactDescription: '' }]
    });

    return { loading, error, categories, initialFormData };
};
