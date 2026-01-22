export declare class TableResource {
    uuid: string;
    number: string;
    capacity: number;
    location: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string | null;
    updatedBy: string | null;
    activeOrdersCount?: number;
    constructor(table: any);
    static collection(tables: any[]): TableResource[];
    toJSON(): any;
}
