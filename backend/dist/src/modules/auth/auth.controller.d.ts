import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResendVerificationDto, ResetPasswordDto, RefreshTokenDto } from './dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
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
    refresh(refreshTokenDto: RefreshTokenDto): Promise<{
        message: string;
        data: {
            accessToken: string;
            refreshToken: string;
        };
    }>;
    logout(body: {
        refreshToken?: string;
    }): Promise<{
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
    resendVerification(resendVerificationDto: ResendVerificationDto): Promise<{
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
    getProfile(req: any): Promise<{
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
    revokeAllTokens(req: any): Promise<{
        message: string;
        data: {};
    }>;
}
