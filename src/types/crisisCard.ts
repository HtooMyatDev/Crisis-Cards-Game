export type Category = {
    id: number;
    name: string;
    color: string;
    accent?: string;
    bg?: string;
    text?: string;
    shadow?: string;
};

export type ResponseOption = {
    text: string;
    politicalEffect: number;
    economicEffect: number;
    infrastructureEffect: number;
    societyEffect: number;
    environmentEffect: number;
    score: number; // Score field for tracking points
    cost: number; // Cost (budget impact)
    impactDescription?: string; // Narrative consequence of this choice
};

export type FormState = {
    title: string;
    description: string;
    categoryId: number | '';
    categoryName: string;
    status: 'Active' | 'Inactive';
    timeLimit: number;
    responseOptions: ResponseOption[];
};

export type ResponseOptionErrors = Partial<{
    text: string;
    politicalEffect: string;
    economicEffect: string;
    infrastructureEffect: string;
    societyEffect: string;
    environmentEffect: string;
    score: string; // Score validation errors
    impactDescription: string;
}>;

export type FormErrors = Partial<{
    title: string;
    description: string;
    categoryId: string;
    timeLimit: string;
    responseOptions: ResponseOptionErrors[];
}>;
