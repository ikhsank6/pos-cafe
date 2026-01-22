"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const uuid_1 = require("uuid");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const swagger_1 = require("@nestjs/swagger");
const fs_1 = require("fs");
const media_service_1 = require("../media/media.service");
const uploadPath = './uploads/images';
let UploadController = class UploadController {
    mediaService;
    constructor(mediaService) {
        this.mediaService = mediaService;
    }
    async uploadImage(file, req) {
        if (!file) {
            throw new common_1.NotFoundException('File not received by server');
        }
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/jpg'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
            throw new common_1.BadRequestException(`Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`);
        }
        const media = await this.mediaService.create({
            filename: file.filename,
            originalName: file.originalname,
            mimeType: file.mimetype,
            size: file.size,
            path: `/uploads/images/${file.filename}`,
            createdBy: req.user?.name || req.user?.email,
        });
        return {
            uuid: media.uuid,
            filename: media.filename,
            original_name: media.originalName,
            url: `/upload/images/${media.uuid}`,
        };
    }
    async getImage(uuid, res) {
        const media = await this.mediaService.findByUuid(uuid);
        if (!media) {
            throw new common_1.NotFoundException('Image not found');
        }
        const filePath = (0, path_1.join)(process.cwd(), uploadPath, media.filename);
        if (!(0, fs_1.existsSync)(filePath)) {
            throw new common_1.NotFoundException('Image file not found');
        }
        return res.sendFile(filePath);
    }
    async deleteMedia(uuid) {
        return this.mediaService.delete(uuid);
    }
};
exports.UploadController = UploadController;
__decorate([
    (0, common_1.Post)('image'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: uploadPath,
            filename: (req, file, callback) => {
                const uniqueSuffix = (0, uuid_1.v4)();
                const ext = (0, path_1.extname)(file.originalname);
                callback(null, `${uniqueSuffix}${ext}`);
            },
        }),
    })),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    }),
    (0, swagger_1.ApiOperation)({ summary: 'Upload an image file' }),
    __param(0, (0, common_1.UploadedFile)(new common_1.ParseFilePipe({
        validators: [
            new common_1.MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
        ],
    }))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "uploadImage", null);
__decorate([
    (0, common_1.Get)('images/:uuid'),
    (0, swagger_1.ApiOperation)({ summary: 'Get uploaded image by UUID' }),
    __param(0, (0, common_1.Param)('uuid')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "getImage", null);
__decorate([
    (0, common_1.Delete)(':uuid'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Delete uploaded media' }),
    __param(0, (0, common_1.Param)('uuid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UploadController.prototype, "deleteMedia", null);
exports.UploadController = UploadController = __decorate([
    (0, swagger_1.ApiTags)('Upload'),
    (0, common_1.Controller)('upload'),
    __metadata("design:paramtypes", [media_service_1.MediaService])
], UploadController);
//# sourceMappingURL=upload.controller.js.map