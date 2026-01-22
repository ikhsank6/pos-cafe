export declare class MenuResource {
    uuid: string;
    name: string;
    path: string | null;
    icon: string | null;
    order: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    parent?: {
        uuid: string;
        name: string;
    } | null;
    children?: MenuResource[];
    constructor(menu: any);
    static collection(menus: any[]): MenuResource[];
    toJSON(): any;
}
