export declare class MediaResource {
    uuid: string;
    filename: string;
    original_name: string;
    url: string;
    constructor(media: any);
    static fromEntity(media: any): MediaResource | null;
    toJSON(): {
        uuid: string;
        filename: string;
        original_name: string;
        url: string;
    };
}
