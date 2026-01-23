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
exports.RolesGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const roles_decorator_1 = require("../decorators/roles.decorator");
let RolesGuard = class RolesGuard {
    reflector;
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(roles_decorator_1.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        console.log('--- RolesGuard Debug Start ---');
        console.log('Request Path:', context.switchToHttp().getRequest().url);
        console.log('Required Roles:', requiredRoles);
        console.log('User Payload:', JSON.stringify(user));
        if (!user) {
            console.log('Result: DENIED - No user in request');
            console.log('--- RolesGuard Debug End ---');
            return false;
        }
        const checkRole = (role) => {
            const name = typeof role === 'string' ? role : role?.name;
            const code = typeof role === 'string' ? role : role?.code;
            const isMatch = requiredRoles.includes(name) ||
                requiredRoles.includes(code) ||
                (requiredRoles.includes('OWNER') && (name === 'Admin' || name === 'Owner' || code === 'ADMIN' || code === 'Admin'));
            console.log(`Checking role [Name: ${name}, Code: ${code}] against ${requiredRoles} -> Match: ${isMatch}`);
            return isMatch;
        };
        if (user.roles && Array.isArray(user.roles)) {
            console.log('Found user.roles array');
            const hasRole = user.roles.some((role) => checkRole(role));
            console.log('Result:', hasRole ? 'ALLOWED' : 'DENIED');
            console.log('--- RolesGuard Debug End ---');
            return hasRole;
        }
        if (user.role) {
            console.log('Found user.role singular');
            const hasRole = checkRole(user.role);
            console.log('Result:', hasRole ? 'ALLOWED' : 'DENIED');
            console.log('--- RolesGuard Debug End ---');
            return hasRole;
        }
        console.log('Result: DENIED - No roles found in user object');
        console.log('--- RolesGuard Debug End ---');
        return false;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
//# sourceMappingURL=roles.guard.js.map