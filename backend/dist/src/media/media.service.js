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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MediaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const fs_1 = require("fs");
const path_1 = require("path");
const uploadPath = './uploads/images';
let MediaService = class MediaService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        return this.prisma.media.create({
            data,
        });
    }
    async findByUuid(uuid) {
        return this.prisma.media.findUnique({
            where: { uuid },
        });
    }
    async findById(id) {
        return this.prisma.media.findUnique({
            where: { id },
        });
    }
    async delete(uuid) {
        const media = await this.findByUuid(uuid);
        if (!media) {
            throw new common_1.NotFoundException('Media not found');
        }
        const filePath = (0, path_1.join)(process.cwd(), uploadPath, media.filename);
        if ((0, fs_1.existsSync)(filePath)) {
            try {
                (0, fs_1.unlinkSync)(filePath);
            }
            catch (err) {
                console.error(`Failed to delete file: ${filePath}`, err);
            }
        }
        await this.prisma.media.delete({
            where: { uuid },
        });
        return true;
    }
    async softDelete(uuid, deletedBy) {
        const media = await this.findByUuid(uuid);
        if (!media) {
            throw new common_1.NotFoundException('Media not found');
        }
        return this.prisma.media.update({
            where: { uuid },
            data: {
                deletedAt: new Date(),
                deletedBy,
            },
        });
    }
};
exports.MediaService = MediaService;
exports.MediaService = MediaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MediaService);
//# sourceMappingURL=media.service.js.map