export declare class CategoryResource {
    uuid: string;
    name: string;
    description: string | null;
    icon: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    productCount?: number;
    constructor(category: any);
    static collection(categories: any[]): CategoryResource[];
    toJSON(): any;
}
