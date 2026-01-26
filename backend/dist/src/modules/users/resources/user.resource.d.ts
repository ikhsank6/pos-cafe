export declare class UserResource {
    uuid: string;
    username: string;
    fullName: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    isActive: boolean;
    verifiedAt: string | null;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    roles: {
        uuid: string;
        name: string;
        code: string;
        description?: string;
    }[];
    activeRole: {
        uuid: string;
        name: string;
        code: string;
        description?: string;
    } | null;
    constructor(user: any);
    static collection(users: any[]): UserResource[];
    toJSON(): {
        uuid: string;
        username: string;
        fullName: string;
        email: string;
        phone: string | null;
        avatar: string | null;
        isActive: boolean;
        verifiedAt: string | null;
        createdAt: string;
        updatedAt: string;
        createdBy: string | null;
        updatedBy: string | null;
        roles: {
            uuid: string;
            name: string;
            code: string;
            description?: string;
        }[];
        activeRole: {
            uuid: string;
            name: string;
            code: string;
            description?: string;
        } | null;
    };
}
