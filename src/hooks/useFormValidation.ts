import { FormState, FormErrors, ResponseOption, ResponseOptionErrors } from '../types/crisisCard';

export const useFormValidation = () => {
    const validateForm = (formData: FormState): { isValid: boolean; errors: FormErrors } => {
        const errors: FormErrors = {};

        // Title validation
        if (!formData.title || formData.title.trim().length < 2) {
            errors.title = 'Title is required (min 2 characters)';
        }

        // Description validation
        if (!formData.description || formData.description.trim().length < 10) {
            errors.description = 'Description is required (min 10 characters)';
        }

        // Category validation
        if (formData.categoryId === '' || typeof formData.categoryId !== 'number') {
            errors.categoryId = 'Category is required';
        }

        // Time limit validation
        if (typeof formData.timeLimit !== 'number' || formData.timeLimit < 1 || formData.timeLimit > 120) {
            errors.timeLimit = 'Time limit must be between 1 and 120 minutes';
        }

        // Response options validation
        const optionErrors = validateResponseOptions(formData.responseOptions);
        if (optionErrors.length > 0) errors.responseOptions = optionErrors;

        return { isValid: Object.keys(errors).length === 0, errors };
    };

    const validateResponseOptions = (options: ResponseOption[]) => {
        const optionErrors: ResponseOptionErrors[] = [];
        const effectInRange = (v: number) => v >= -10 && v <= 10;

        if (options.length !== 3) {
            optionErrors[0] = { text: 'Exactly 3 response options are required' };
        }

        const nonEmptyOptions = options.filter(o => o.text.trim().length > 0);
        if (nonEmptyOptions.length < 3) {
             // This might be redundant if we check length above, but good for sanity if we allow empty strings in the array
             // actually, let's just rely on the individual field validation below
        }

        options.forEach((opt, idx) => {
            const oe: ResponseOptionErrors = {};
            const textLen = opt.text.trim().length;

            if (opt.text.trim().length < 2 || opt.text.trim().length > 100) {
                oe.text = 'Text must be 2-100 characters';
            }

            if (!effectInRange(opt.politicalEffect)) oe.politicalEffect = 'Political effect must be between -10 and 10';
            if (!effectInRange(opt.economicEffect)) oe.economicEffect = 'Economic effect must be between -10 and 10';
            if (!effectInRange(opt.infrastructureEffect)) oe.infrastructureEffect = 'Infrastructure effect must be between -10 and 10';
            if (!effectInRange(opt.societyEffect)) oe.societyEffect = 'Society effect must be between -10 and 10';
            if (!effectInRange(opt.environmentEffect)) oe.environmentEffect = 'Environment effect must be between -10 and 10';

            // Score validation
            if (opt.score < 0) oe.score = 'Score cannot be negative';

            if (Object.keys(oe).length > 0) optionErrors[idx] = oe;
        });

        return optionErrors;
    };

    return { validateForm };
};
