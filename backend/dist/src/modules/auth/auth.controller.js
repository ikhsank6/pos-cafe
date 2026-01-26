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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const auth_service_1 = require("./auth.service");
const dto_1 = require("./dto");
const jwt_guard_1 = require("../../common/guards/jwt.guard");
const login_throttler_guard_1 = require("../../common/guards/login-throttler.guard");
const auth_throttler_guard_1 = require("../../common/guards/auth-throttler.guard");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async login(loginDto) {
        return this.authService.login(loginDto);
    }
    async refresh(refreshTokenDto) {
        return this.authService.refreshAccessToken(refreshTokenDto.refreshToken);
    }
    async logout(body) {
        return this.authService.logout(body.refreshToken);
    }
    async register(registerDto) {
        return this.authService.register(registerDto);
    }
    async verifyEmail(token) {
        return this.authService.verifyEmail(token);
    }
    async resendVerification(resendVerificationDto) {
        return this.authService.resendVerificationEmail(resendVerificationDto.email);
    }
    async forgotPassword(forgotPasswordDto) {
        return this.authService.forgotPassword(forgotPasswordDto);
    }
    async resetPassword(resetPasswordDto) {
        return this.authService.resetPassword(resetPasswordDto);
    }
    async getProfile(req) {
        return this.authService.getProfile(req.user.sub);
    }
    async revokeAllTokens(req) {
        return this.authService.revokeAllTokens(req.user.sub);
    }
    async switchRole(req, body) {
        return this.authService.switchRole(req.user.sub, body.roleUuid);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(login_throttler_guard_1.LoginThrottlerGuard),
    (0, swagger_1.ApiOperation)({ summary: 'User login', description: 'Login with email and password to get JWT token. Rate limited to 3 attempts per minute.' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Login successful - Copy the accessToken and click "Authorize" button to use it',
        schema: {
            example: {
                success: true,
                message: 'Login berhasil',
                data: {
                    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    refreshToken: 'a1b2c3d4e5f6...',
                    refreshTokenEnabled: true,
                    user: {
                        id: 1,
                        email: 'admin@example.com',
                        name: 'Administrator',
                        role: { id: 1, name: 'Admin' }
                    }
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid credentials' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too many login attempts. Please try again later.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.LoginDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Refresh access token', description: 'Get a new access token using refresh token. Only works if REFRESH_TOKEN_ENABLED=true.' }),
    (0, swagger_1.ApiResponse)({
        status: 200,
        description: 'Token refreshed successfully',
        schema: {
            example: {
                message: 'Token refreshed successfully',
                data: {
                    accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                    refreshToken: 'new_refresh_token...'
                }
            }
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Refresh token is disabled' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Invalid or expired refresh token' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RefreshTokenDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.Post)('logout'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Logout', description: 'Logout user and revoke refresh token (if provided).' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Logout successful' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'User registration', description: 'Register a new user account (auto-assigned User role). A verification email will be sent. Rate limited to 10 attempts per minute.' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Registration successful. Verification email sent.' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Email already exists or validation error' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too many requests. Please try again later.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('verify-email'),
    (0, swagger_1.ApiOperation)({ summary: 'Verify email', description: 'Verify user email address using the token sent via email' }),
    (0, swagger_1.ApiQuery)({ name: 'token', required: true, description: 'Verification token from email' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Email verified successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid or expired token' }),
    __param(0, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, common_1.Post)('resend-verification'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Resend verification email', description: 'Resend verification email to user. Rate limited to 10 attempts per minute.' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Verification email sent (if email exists and not verified)' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too many requests. Please try again later.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ResendVerificationDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resendVerification", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Forgot password', description: 'Request password reset email. Rate limited to 10 attempts per minute.' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset email sent (if email exists)' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too many requests. Please try again later.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ForgotPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({ summary: 'Reset password', description: 'Reset password using token from email. Rate limited to 10 attempts per minute.' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Password reset successful' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Invalid or expired token' }),
    (0, swagger_1.ApiResponse)({ status: 429, description: 'Too many requests. Please try again later.' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.ResetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user profile', description: 'Get current authenticated user profile' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'User profile data' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized - JWT token required' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Post)('revoke-all-tokens'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Revoke all refresh tokens', description: 'Revoke all refresh tokens for current user (logout from all devices)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'All tokens revoked' }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Unauthorized' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "revokeAllTokens", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Post)('switch-role'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiOperation)({ summary: 'Switch active role', description: 'Switch currently active role' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "switchRole", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('1. System : Authentication'),
    (0, common_1.UseGuards)(auth_throttler_guard_1.AuthThrottlerGuard),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map