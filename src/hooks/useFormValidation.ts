import { FormState, FormErrors } from '../types/crisisCard';

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

        // Base values validation
        const inRange50 = (v: number) => v >= -50 && v <= 50;
        if (!inRange50(formData.pwValue)) errors.pwValue = 'PW must be between -50 and 50';
        if (!inRange50(formData.efValue)) errors.efValue = 'EF must be between -50 and 50';
        if (!inRange50(formData.psValue)) errors.psValue = 'PS must be between -50 and 50';
        if (!inRange50(formData.grValue)) errors.grValue = 'GR must be between -50 and 50';

        // Response options validation
        const optionErrors = validateResponseOptions(formData.responseOptions);
        if (optionErrors.length > 0) errors.responseOptions = optionErrors;

        return { isValid: Object.keys(errors).length === 0, errors };
    };

    const validateResponseOptions = (options: ResponseOption[]) => {
        const optionErrors: ResponseOptionErrors[] = [];
        const effectInRange = (v: number) => v >= -10 && v <= 10;

        const nonEmptyOptions = options.filter(o => o.text.trim().length > 0);
        if (nonEmptyOptions.length === 0) {
            optionErrors[0] = { text: 'At least one response option is required' };
        }

        options.forEach((opt, idx) => {
            const oe: ResponseOptionErrors = {};
            const textLen = opt.text.trim().length;

            if (textLen > 0 && (textLen < 2 || textLen > 100)) {
                oe.text = 'Text must be 2-100 characters when provided';
            }

            if (!effectInRange(opt.pwEffect)) oe.pwEffect = 'PW effect must be between -10 and 10';
            if (!effectInRange(opt.efEffect)) oe.efEffect = 'EF effect must be between -10 and 10';
            if (!effectInRange(opt.psEffect)) oe.psEffect = 'PS effect must be between -10 and 10';
            if (!effectInRange(opt.grEffect)) oe.grEffect = 'GR effect must be between -10 and 10';

            if (Object.keys(oe).length > 0) optionErrors[idx] = oe;
        });

        return optionErrors;
    };

    return { validateForm };
};
