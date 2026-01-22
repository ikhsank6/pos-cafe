export declare class CreateUserDto {
    username: string;
    fullName: string;
    email: string;
    phone?: string;
    password?: string;
    roleUuid: string;
    isActive?: boolean;
}
export declare class UpdateUserDto {
    username?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    password?: string;
    roleUuid?: string;
    isActive?: boolean;
}
