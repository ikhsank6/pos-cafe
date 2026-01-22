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
exports.AuthThrottlerGuard = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
let AuthThrottlerGuard = class AuthThrottlerGuard extends throttler_1.ThrottlerGuard {
    errorMessage = 'Terlalu banyak percobaan. Silakan coba lagi dalam beberapa menit.';
    throttlerOptions;
    constructor(options, storageService, reflector) {
        super(options, storageService, reflector);
        this.throttlerOptions = options;
    }
    async canActivate(context) {
        const request = context.switchToHttp().getRequest();
        const ip = request.ip || request.connection?.remoteAddress || 'unknown';
        const key = `auth_${ip}`;
        const config = Array.isArray(this.throttlerOptions)
            ? this.throttlerOptions.find(c => c.name === 'auth') || this.throttlerOptions.find(c => c.name === 'login') || this.throttlerOptions[0]
            : this.throttlerOptions.throttlers?.[0] || { limit: 10, ttl: 60000 };
        const limit = config?.limit || 10;
        const ttl = config?.ttl || 60000;
        const { totalHits } = await this.storageService.increment(key, ttl, limit, ttl, 'auth');
        if (totalHits > limit) {
            throw new throttler_1.ThrottlerException(this.errorMessage);
        }
        return true;
    }
    getTracker(req) {
        return Promise.resolve(req.ip || req.connection?.remoteAddress || 'unknown');
    }
};
exports.AuthThrottlerGuard = AuthThrottlerGuard;
exports.AuthThrottlerGuard = AuthThrottlerGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [Object, Object, core_1.Reflector])
], AuthThrottlerGuard);
//# sourceMappingURL=auth-throttler.guard.js.map