export declare class MenuAccessResource {
    uuid: string;
    createdAt: string;
    updatedAt: string;
    role?: {
        uuid: string;
        name: string;
    } | null;
    menu?: {
        uuid: string;
        name: string;
        path: string | null;
        icon: string | null;
        order: number;
        isActive: boolean;
    } | null;
    constructor(menuAccess: any);
    static collection(menuAccessList: any[]): MenuAccessResource[];
    toJSON(): any;
}
