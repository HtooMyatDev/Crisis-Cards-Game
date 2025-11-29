export interface Category {
    id: number;
    name: string;
    description: string;
    color: string;
    status: 'Active' | 'Inactive';
    itemCount?: number;
    createdDate?: string;
    lastModified?: string;
}

export interface CategoryFormState {
    name: string;
    description: string;
    color: string;
    status: 'Active' | 'Inactive';
}
