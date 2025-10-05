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
    pwEffect: number;
    efEffect: number;
    psEffect: number;
    grEffect: number;
};

export type FormState = {
    title: string;
    description: string;
    categoryId: number | '';
    categoryName: string;
    status: 'Active' | 'Inactive';
    timeLimit: number;
    pwValue: number;
    efValue: number;
    psValue: number;
    grValue: number;
    responseOptions: ResponseOption[];
};

export type ResponseOptionErrors = Partial<{
    text: string;
    pwEffect: string;
    efEffect: string;
    psEffect: string;
    grEffect: string;
}>;

export type FormErrors = Partial<{
    title: string;
    description: string;
    categoryId: string;
    timeLimit: string;
    pwValue: string;
    efValue: string;
    psValue: string;
    grValue: string;
    responseOptions: ResponseOptionErrors[];
}>;
