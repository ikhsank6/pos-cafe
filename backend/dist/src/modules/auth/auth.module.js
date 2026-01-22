"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const throttler_1 = require("@nestjs/throttler");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const jwt_strategy_1 = require("./jwt.strategy");
const config_1 = require("@nestjs/config");
const menu_access_module_1 = require("../menu-access/menu-access.module");
const queue_module_1 = require("../queue/queue.module");
const login_throttler_guard_1 = require("../../common/guards/login-throttler.guard");
const auth_throttler_guard_1 = require("../../common/guards/auth-throttler.guard");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule.register({ defaultStrategy: 'jwt' }),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET') || 'secret',
                    signOptions: {
                        expiresIn: (configService.get('JWT_EXPIRES_IN') || '7d'),
                    },
                }),
                inject: [config_1.ConfigService],
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ([
                    {
                        name: 'login',
                        ttl: configService.get('THROTTLE_LOGIN_TTL') || 60000,
                        limit: configService.get('THROTTLE_LOGIN_LIMIT') || 5,
                    },
                    {
                        name: 'auth',
                        ttl: configService.get('THROTTLE_AUTH_TTL') || 60000,
                        limit: configService.get('THROTTLE_AUTH_LIMIT') || 10,
                    },
                ]),
                inject: [config_1.ConfigService],
            }),
            menu_access_module_1.MenuAccessModule,
            queue_module_1.QueueModule,
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JwtStrategy, login_throttler_guard_1.LoginThrottlerGuard, auth_throttler_guard_1.AuthThrottlerGuard],
        exports: [auth_service_1.AuthService, login_throttler_guard_1.LoginThrottlerGuard, auth_throttler_guard_1.AuthThrottlerGuard],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map