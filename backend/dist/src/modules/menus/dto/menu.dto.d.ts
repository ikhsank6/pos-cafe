export declare class CreateMenuDto {
    name: string;
    path?: string;
    icon?: string;
    parentUuid?: string;
    order?: number;
    isActive?: boolean;
}
export declare class UpdateMenuDto {
    name?: string;
    path?: string;
    icon?: string;
    parentUuid?: string | null;
    order?: number;
    isActive?: boolean;
}
export declare class ReorderMenuItemDto {
    uuid: string;
    order: number;
    parentUuid?: string | null;
}
export declare class ReorderMenusDto {
    items: ReorderMenuItemDto[];
}
