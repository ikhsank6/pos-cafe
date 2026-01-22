"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaResource = void 0;
class MediaResource {
    uuid;
    filename;
    original_name;
    url;
    constructor(media) {
        this.uuid = media.uuid;
        this.filename = media.filename;
        this.original_name = media.originalName || media.original_name;
        this.url = `/upload/images/${media.uuid}`;
    }
    static fromEntity(media) {
        if (!media)
            return null;
        return new MediaResource(media);
    }
    toJSON() {
        return {
            uuid: this.uuid,
            filename: this.filename,
            original_name: this.original_name,
            url: this.url,
        };
    }
}
exports.MediaResource = MediaResource;
//# sourceMappingURL=media.resource.js.map