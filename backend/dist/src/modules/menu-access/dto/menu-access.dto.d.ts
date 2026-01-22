export declare class CreateMenuAccessDto {
    roleUuid: string;
    menuUuid: string;
}
export declare class UpdateMenuAccessDto {
    menuUuid?: string;
}
export declare class BulkMenuAccessDto {
    roleUuid: string;
    menuUuids: string[];
}
export declare class MenuAccessItemDto {
    menuUuid: string;
}
