export declare class RoleResource {
    uuid: string;
    name: string;
    code: string;
    description: string | null;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    menuAccess?: any[];
    constructor(role: any);
    static collection(roles: any[]): RoleResource[];
    toJSON(): any;
}
