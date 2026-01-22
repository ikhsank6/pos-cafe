import { PrismaService } from '../prisma/prisma.service';
export interface CreateMediaDto {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    createdBy?: string;
}
export declare class MediaService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: CreateMediaDto): Promise<any>;
    findByUuid(uuid: string): Promise<any>;
    findById(id: number): Promise<any>;
    delete(uuid: string): Promise<boolean>;
    softDelete(uuid: string, deletedBy?: string): Promise<any>;
}
