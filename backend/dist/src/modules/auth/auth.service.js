"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../../prisma/prisma.service");
const hash_util_1 = require("../../common/utils/hash.util");
const menu_access_service_1 = require("../menu-access/menu-access.service");
const queue_service_1 = require("../queue/queue.service");
const uuid_1 = require("uuid");
const crypto = __importStar(require("crypto"));
let AuthService = class AuthService {
    prisma;
    jwtService;
    configService;
    menuAccessService;
    queueService;
    refreshTokenEnabled;
    refreshTokenSecret;
    refreshTokenExpiresIn;
    constructor(prisma, jwtService, configService, menuAccessService, queueService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
        this.menuAccessService = menuAccessService;
        this.queueService = queueService;
        this.refreshTokenEnabled = this.configService.get('REFRESH_TOKEN_ENABLED', 'false') === 'true';
        this.refreshTokenSecret = this.configService.get('REFRESH_TOKEN_SECRET', 'refresh_secret');
        this.refreshTokenExpiresIn = this.configService.get('REFRESH_TOKEN_EXPIRES_IN', '7d');
    }
    async login(loginDto) {
        const user = await this.prisma.user.findFirst({
            where: { email: loginDto.email, deletedAt: null },
            include: {
                userRoles: {
                    include: { role: true },
                    where: { deletedAt: null }
                },
                activeRole: true
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Email atau password salah.');
        }
        const isPasswordValid = await (0, hash_util_1.comparePassword)(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Email atau password salah.');
        }
        if (!user.verifiedAt) {
            throw new common_1.UnauthorizedException('Email belum diverifikasi. Silakan cek email Anda.');
        }
        if (!user.isActive) {
            throw new common_1.UnauthorizedException('Akun tidak aktif.');
        }
        const primaryRole = user.userRoles?.[0]?.role;
        let activeRole = user.activeRole ? {
            uuid: user.activeRole.uuid,
            name: user.activeRole.name,
            code: user.activeRole.code,
        } : null;
        if (!activeRole && user.userRoles?.length > 0) {
            const firstRole = user.userRoles[0].role;
            activeRole = {
                uuid: firstRole.uuid,
                name: firstRole.name,
                code: firstRole.code,
            };
            await this.prisma.user.update({
                where: { id: user.id },
                data: { activeRoleId: firstRole.id }
            });
        }
        const roles = user.userRoles?.map(ur => ({
            uuid: ur.role.uuid,
            name: ur.role.name,
            code: ur.role.code,
        })) || [];
        const payload = {
            sub: user.id,
            uuid: user.uuid,
            email: user.email,
            fullName: user.fullName,
            avatar: user.avatar,
            roles: roles,
            activeRole: activeRole
        };
        const accessToken = this.jwtService.sign(payload);
        let menus = [];
        if (primaryRole) {
            const menusResult = await this.menuAccessService.getAccessibleMenus(primaryRole.id);
            menus = menusResult.data;
        }
        let refreshToken;
        if (this.refreshTokenEnabled) {
            refreshToken = await this.generateRefreshToken(user.id);
        }
        return {
            message: 'Login berhasil',
            data: {
                accessToken,
                ...(this.refreshTokenEnabled && { refreshToken }),
                user: {
                    uuid: user.uuid,
                    username: user.username,
                    email: user.email,
                    fullName: user.fullName,
                    avatar: user.avatar || null,
                    isActive: user.isActive,
                    verifiedAt: user.verifiedAt,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt,
                    roles: roles,
                    activeRole: activeRole,
                },
                menus,
            },
        };
    }
    async generateRefreshToken(userId) {
        const token = crypto.randomBytes(64).toString('hex');
        const expiresAt = this.calculateExpiry(this.refreshTokenExpiresIn);
        await this.cleanupOldRefreshTokens(userId);
        await this.prisma.refreshToken.create({
            data: {
                token,
                userId,
                expiresAt,
            },
        });
        return token;
    }
    calculateExpiry(duration) {
        const match = duration.match(/^(\d+)([dhms])$/);
        if (!match) {
            return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        }
        const value = parseInt(match[1]);
        const unit = match[2];
        const ms = {
            'd': 24 * 60 * 60 * 1000,
            'h': 60 * 60 * 1000,
            'm': 60 * 1000,
            's': 1000,
        }[unit] || 24 * 60 * 60 * 1000;
        return new Date(Date.now() + value * ms);
    }
    async cleanupOldRefreshTokens(userId) {
        const tokens = await this.prisma.refreshToken.findMany({
            where: { userId, revokedAt: null },
            orderBy: { createdAt: 'desc' },
        });
        if (tokens.length >= 5) {
            const tokensToDelete = tokens.slice(4);
            await this.prisma.refreshToken.deleteMany({
                where: { id: { in: tokensToDelete.map(t => t.id) } },
            });
        }
    }
    async refreshAccessToken(refreshToken) {
        if (!this.refreshTokenEnabled) {
            throw new common_1.BadRequestException('Refresh token is disabled.');
        }
        const storedToken = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: {
                user: {
                    include: {
                        userRoles: {
                            include: { role: true },
                            where: { deletedAt: null }
                        }
                    }
                }
            },
        });
        if (!storedToken) {
            throw new common_1.UnauthorizedException('Invalid refresh token.');
        }
        if (storedToken.revokedAt) {
            throw new common_1.UnauthorizedException('Refresh token has been revoked.');
        }
        if (storedToken.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token has expired.');
        }
        const user = storedToken.user;
        if (!user || user.deletedAt || !user.isActive) {
            throw new common_1.UnauthorizedException('User not found or inactive.');
        }
        const roles = user.userRoles?.map(ur => ({
            uuid: ur.role.uuid,
            name: ur.role.name,
            code: ur.role.code,
        })) || [];
        const payload = {
            sub: user.id,
            uuid: user.uuid,
            email: user.email,
            fullName: user.fullName,
            avatar: user.avatar,
            roles: roles
        };
        const accessToken = this.jwtService.sign(payload);
        const newRefreshToken = await this.generateRefreshToken(user.id);
        await this.prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revokedAt: new Date() },
        });
        return {
            message: 'Token refreshed successfully',
            data: {
                accessToken,
                refreshToken: newRefreshToken,
            },
        };
    }
    async logout(refreshToken) {
        if (refreshToken && this.refreshTokenEnabled) {
            await this.prisma.refreshToken.updateMany({
                where: { token: refreshToken },
                data: { revokedAt: new Date() },
            });
        }
        return {
            message: 'Logout berhasil',
            data: {},
        };
    }
    async revokeAllTokens(userId) {
        await this.prisma.refreshToken.updateMany({
            where: { userId, revokedAt: null },
            data: { revokedAt: new Date() },
        });
        return {
            message: 'All tokens revoked',
            data: {},
        };
    }
    async register(registerDto) {
        return this.prisma.$transaction(async (prisma) => {
            const existingEmail = await prisma.user.findFirst({
                where: { email: registerDto.email, deletedAt: null },
            });
            if (existingEmail) {
                throw new common_1.BadRequestException('Email sudah terdaftar.');
            }
            const existingUsername = await prisma.user.findFirst({
                where: { username: registerDto.username, deletedAt: null },
            });
            if (existingUsername) {
                throw new common_1.BadRequestException('Username sudah terdaftar.');
            }
            const defaultRole = await prisma.role.findFirst({
                where: { code: 'USER', deletedAt: null },
            });
            if (!defaultRole) {
                throw new common_1.BadRequestException('Role default tidak ditemukan. Silakan hubungi administrator.');
            }
            const hashedPassword = await (0, hash_util_1.hashPassword)(registerDto.password);
            const verificationToken = (0, uuid_1.v4)();
            const user = await prisma.user.create({
                data: {
                    username: registerDto.username,
                    fullName: registerDto.fullName,
                    email: registerDto.email,
                    password: hashedPassword,
                    isActive: false,
                    verificationToken,
                },
            });
            await prisma.userRole.create({
                data: {
                    userId: user.id,
                    roleId: defaultRole.id,
                },
            });
            await this.queueService.addVerificationEmailJob({
                email: user.email,
                name: user.fullName,
                verificationToken,
                createdAt: user.createdAt.toISOString(),
            });
            return {
                message: 'Registrasi berhasil. Silakan cek email Anda untuk verifikasi.',
                data: {
                    user: {
                        uuid: user.uuid,
                        username: user.username,
                        email: user.email,
                        fullName: user.fullName,
                        roles: [{
                                uuid: defaultRole.uuid,
                                name: defaultRole.name,
                                code: defaultRole.code,
                            }],
                    },
                },
            };
        });
    }
    async verifyEmail(token) {
        return this.prisma.$transaction(async (prisma) => {
            let user = await prisma.user.findFirst({
                where: { verificationToken: token, deletedAt: null },
            });
            if (!user) {
                throw new common_1.BadRequestException('Token verifikasi tidak valid atau sudah kadaluarsa.');
            }
            if (user.verifiedAt) {
                return {
                    message: 'Email sudah diverifikasi sebelumnya.',
                    data: {},
                };
            }
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    verifiedAt: new Date(),
                    isActive: true,
                    verificationToken: null,
                },
            });
            return {
                message: 'Email berhasil diverifikasi. Anda sekarang dapat login.',
                data: {},
            };
        });
    }
    async resendVerificationEmail(email) {
        return this.prisma.$transaction(async (prisma) => {
            const user = await prisma.user.findFirst({
                where: { email, deletedAt: null },
            });
            if (!user) {
                return {
                    message: 'Jika email terdaftar, link verifikasi telah dikirim.',
                    data: {},
                };
            }
            if (user.verifiedAt) {
                throw new common_1.BadRequestException('Email sudah diverifikasi.');
            }
            const verificationToken = (0, uuid_1.v4)();
            await prisma.user.update({
                where: { id: user.id },
                data: { verificationToken },
            });
            await this.queueService.addVerificationEmailJob({
                email: user.email,
                name: user.fullName,
                verificationToken,
                createdAt: user.createdAt.toISOString(),
            });
            return {
                message: 'Link verifikasi telah dikirim ke email Anda.',
                data: {},
            };
        });
    }
    async forgotPassword(forgotPasswordDto) {
        return this.prisma.$transaction(async (prisma) => {
            const user = await prisma.user.findFirst({
                where: { email: forgotPasswordDto.email, deletedAt: null },
            });
            if (!user) {
                return {
                    message: 'Jika email terdaftar, instruksi reset password telah dikirim.',
                    data: {},
                };
            }
            const resetPasswordToken = (0, uuid_1.v4)();
            const resetPasswordExpires = new Date();
            resetPasswordExpires.setHours(resetPasswordExpires.getHours() + 1);
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    resetPasswordToken,
                    resetPasswordExpires,
                },
            });
            await this.queueService.addResetPasswordEmailJob({
                email: user.email,
                name: user.fullName,
                resetToken: resetPasswordToken,
            });
            return {
                message: 'Instruksi reset password telah dikirim ke email.',
                data: {},
            };
        });
    }
    async resetPassword(resetPasswordDto) {
        return this.prisma.$transaction(async (prisma) => {
            const user = await prisma.user.findFirst({
                where: {
                    resetPasswordToken: resetPasswordDto.token,
                    resetPasswordExpires: {
                        gt: new Date(),
                    },
                    deletedAt: null,
                },
            });
            if (!user) {
                throw new common_1.BadRequestException('Token reset password tidak valid atau sudah kadaluarsa.');
            }
            const hashedPassword = await (0, hash_util_1.hashPassword)(resetPasswordDto.password);
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    password: hashedPassword,
                    resetPasswordToken: null,
                    resetPasswordExpires: null,
                },
            });
            return {
                message: 'Password berhasil diupdate. Silakan login dengan password baru Anda.',
                data: {},
            };
        });
    }
    async validateUser(userId) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, deletedAt: null },
            include: {
                userRoles: {
                    include: { role: true },
                    where: { deletedAt: null }
                }
            },
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('User tidak ditemukan atau tidak aktif.');
        }
        return user;
    }
    async getProfile(userId) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, deletedAt: null },
            include: {
                userRoles: {
                    include: { role: true },
                    where: { deletedAt: null }
                },
                activeRole: true
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User tidak ditemukan.');
        }
        const roles = user.userRoles?.map(ur => ({
            uuid: ur.role.uuid,
            name: ur.role.name,
            code: ur.role.code,
        })) || [];
        const activeRole = user.activeRole ? {
            uuid: user.activeRole.uuid,
            name: user.activeRole.name,
            code: user.activeRole.code,
        } : null;
        return {
            message: 'Success',
            data: {
                uuid: user.uuid,
                username: user.username,
                email: user.email,
                fullName: user.fullName,
                phone: user.phone,
                avatar: user.avatar,
                isActive: user.isActive,
                verifiedAt: user.verifiedAt,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                roles: roles,
                activeRole: activeRole,
            },
        };
    }
    async switchRole(userId, roleUuid) {
        const user = await this.prisma.user.findFirst({
            where: { id: userId, deletedAt: null },
            include: {
                userRoles: {
                    include: { role: true },
                    where: { deletedAt: null }
                }
            }
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User tidak ditemukan.');
        }
        const userRole = user.userRoles.find(ur => ur.role.uuid === roleUuid);
        if (!userRole) {
            throw new common_1.BadRequestException('Role tidak valid atau tidak dimiliki user.');
        }
        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: { activeRoleId: userRole.role.id },
            include: {
                activeRole: true,
                userRoles: {
                    include: { role: true },
                    where: { deletedAt: null }
                }
            }
        });
        const roles = updatedUser.userRoles.map(ur => ({
            uuid: ur.role.uuid,
            name: ur.role.name,
            code: ur.role.code,
        }));
        if (!updatedUser.activeRole) {
            throw new common_1.BadRequestException('Gagal memproses role aktif.');
        }
        const activeRole = {
            uuid: updatedUser.activeRole.uuid,
            name: updatedUser.activeRole.name,
            code: updatedUser.activeRole.code,
        };
        const payload = {
            sub: updatedUser.id,
            uuid: updatedUser.uuid,
            email: updatedUser.email,
            fullName: updatedUser.fullName,
            avatar: updatedUser.avatar,
            roles: roles,
            activeRole: activeRole
        };
        const accessToken = this.jwtService.sign(payload);
        const menusResult = await this.menuAccessService.getAccessibleMenus(updatedUser.activeRole.id);
        const menus = menusResult.data;
        let refreshToken;
        if (this.refreshTokenEnabled) {
            refreshToken = await this.generateRefreshToken(userId);
        }
        return {
            message: 'Role berhasil diganti',
            data: {
                accessToken,
                ...(this.refreshTokenEnabled && { refreshToken }),
                user: {
                    uuid: updatedUser.uuid,
                    username: updatedUser.username,
                    email: updatedUser.email,
                    fullName: updatedUser.fullName,
                    avatar: updatedUser.avatar || null,
                    isActive: updatedUser.isActive,
                    verifiedAt: updatedUser.verifiedAt,
                    createdAt: updatedUser.createdAt,
                    updatedAt: updatedUser.updatedAt,
                    roles: roles,
                    activeRole: activeRole,
                },
                menus,
            },
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService,
        menu_access_service_1.MenuAccessService,
        queue_service_1.QueueService])
], AuthService);
//# sourceMappingURL=auth.service.js.map