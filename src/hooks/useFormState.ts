import { useState, useCallback } from 'react';
import { FormState, ResponseOption } from '../types/crisisCard';

export const useFormState = (initialData: FormState | null) => {
    const [formData, setFormData] = useState<FormState>(
        initialData || {
            title: '',
            description: '',
            categoryId: '',
            categoryName: '',
            status: 'Active',
            timeLimit: 15,
            political: 0,
            economic: 0,
            infrastructure: 0,
            society: 0,
            environment: 0,
            responseOptions: [{ text: '', politicalEffect: 0, economicEffect: 0, infrastructureEffect: 0, societyEffect: 0, environmentEffect: 0, score: 0 }]
        }
    );

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    const updateField = useCallback(<K extends keyof FormState>(field: K, value: FormState[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true);
    }, []);

    const updateNumberField = useCallback((
        field: keyof Pick<FormState, 'political' | 'economic' | 'infrastructure' | 'society' | 'environment' | 'timeLimit'>,
        value: string
    ) => {
        if (value === '') {
            updateField(field, 0);
        } else {
            const numValue = Number(value);
            if (!isNaN(numValue)) {
                updateField(field, numValue);
            }
        }
    }, [updateField]);

    const updateResponseOptions = useCallback((updater: (options: ResponseOption[]) => ResponseOption[]) => {
        setFormData(prev => ({ ...prev, responseOptions: updater(prev.responseOptions) }));
        setHasUnsavedChanges(true);
    }, []);

    // Initialize form data when initialData becomes available
    if (initialData && formData.title === '' && formData.description === '') {
        setFormData(initialData);
    }

    return {
        formData,
        hasUnsavedChanges,
        setHasUnsavedChanges,
        updateField,
        updateNumberField,
        updateResponseOptions
    };
};
