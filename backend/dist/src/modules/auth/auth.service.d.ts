import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto } from './dto';
import { MenuAccessService } from '../menu-access/menu-access.service';
import { QueueService } from '../queue/queue.service';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    private menuAccessService;
    private queueService;
    private readonly refreshTokenEnabled;
    private readonly refreshTokenSecret;
    private readonly refreshTokenExpiresIn;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService, menuAccessService: MenuAccessService, queueService: QueueService);
    login(loginDto: LoginDto): Promise<{
        message: string;
        data: {
            user: {
                uuid: string;
                username: string;
                email: string;
                fullName: string;
                avatar: string | null;
                isActive: true;
                verifiedAt: Date;
                createdAt: Date;
                updatedAt: Date;
                roles: {
                    uuid: string;
                    name: string;
                    code: string;
                }[];
            };
            menus: any[];
            refreshToken?: string | undefined;
            accessToken: string;
        };
    }>;
    private generateRefreshToken;
    private calculateExpiry;
    private cleanupOldRefreshTokens;
    refreshAccessToken(refreshToken: string): Promise<{
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    logout(refreshToken?: string): Promise<{
        message: string;
        data: {};
    }>;
    revokeAllTokens(userId: number): Promise<{
        message: string;
        data: {};
    }>;
    register(registerDto: RegisterDto): Promise<{
        message: string;
        data: {
            user: {
                uuid: string;
                username: string;
                email: string;
                fullName: string;
                roles: {
                    uuid: string;
                    name: string;
                    code: string;
                }[];
            };
        };
    }>;
    verifyEmail(token: string): Promise<{
        message: string;
        data: {};
    }>;
    resendVerificationEmail(email: string): Promise<{
        message: string;
        data: {};
    }>;
    forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{
        message: string;
        data: {};
    }>;
    resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{
        message: string;
        data: {};
    }>;
    validateUser(userId: number): Promise<{
        userRoles: ({
            role: {
                id: number;
                uuid: string;
                name: string;
                code: string;
                description: string | null;
                isActive: boolean;
                createdAt: Date;
                updatedAt: Date;
                deletedAt: Date | null;
                createdBy: string | null;
                updatedBy: string | null;
                deletedBy: string | null;
            };
        } & {
            id: number;
            uuid: string;
            createdAt: Date;
            updatedAt: Date;
            deletedAt: Date | null;
            createdBy: string | null;
            updatedBy: string | null;
            deletedBy: string | null;
            userId: number;
            roleId: number;
        })[];
    } & {
        id: number;
        uuid: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        deletedAt: Date | null;
        createdBy: string | null;
        updatedBy: string | null;
        deletedBy: string | null;
        username: string;
        email: string;
        verificationToken: string | null;
        resetPasswordToken: string | null;
        password: string;
        fullName: string;
        phone: string | null;
        avatar: string | null;
        verifiedAt: Date | null;
        resetPasswordExpires: Date | null;
    }>;
    getProfile(userId: number): Promise<{
        message: string;
        data: {
            uuid: string;
            username: string;
            email: string;
            fullName: string;
            phone: string | null;
            avatar: string | null;
            isActive: boolean;
            verifiedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
            roles: {
                uuid: string;
                name: string;
                code: string;
            }[];
        };
    }>;
}
