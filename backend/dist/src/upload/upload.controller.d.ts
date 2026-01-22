import type { Response } from 'express';
import { MediaService } from '../media/media.service';
export declare class UploadController {
    private mediaService;
    constructor(mediaService: MediaService);
    uploadImage(file: Express.Multer.File, req: any): Promise<{
        uuid: any;
        filename: any;
        original_name: any;
        url: string;
    }>;
    getImage(uuid: string, res: Response): Promise<void>;
    deleteMedia(uuid: string): Promise<boolean>;
}
