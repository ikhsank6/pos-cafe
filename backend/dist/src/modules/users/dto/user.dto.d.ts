export declare class CreateUserDto {
    username: string;
    fullName: string;
    email: string;
    phone?: string;
    password?: string;
    roleUuids: string[];
    isActive?: boolean;
}
export declare class UpdateUserDto {
    username?: string;
    fullName?: string;
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
    roleUuids?: string[];
    isActive?: boolean;
}
