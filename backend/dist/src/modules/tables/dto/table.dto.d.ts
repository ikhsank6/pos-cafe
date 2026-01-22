export declare enum TableStatus {
    AVAILABLE = "AVAILABLE",
    OCCUPIED = "OCCUPIED",
    RESERVED = "RESERVED",
    MAINTENANCE = "MAINTENANCE"
}
export declare class CreateTableDto {
    number: string;
    capacity: number;
    location?: string;
    status?: TableStatus;
}
export declare class UpdateTableDto {
    number?: string;
    capacity?: number;
    location?: string;
    status?: TableStatus;
}
