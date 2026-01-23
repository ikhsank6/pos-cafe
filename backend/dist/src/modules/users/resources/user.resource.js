"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResource = void 0;
class UserResource {
    uuid;
    username;
    fullName;
    email;
    phone;
    avatar;
    isActive;
    verifiedAt;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
    roles;
    role;
    constructor(user) {
        this.uuid = user.uuid;
        this.username = user.username;
        this.fullName = user.fullName;
        this.email = user.email;
        this.phone = user.phone || null;
        this.avatar = user.avatar || null;
        this.isActive = user.isActive;
        this.verifiedAt = user.verifiedAt?.toISOString?.() || user.verifiedAt || null;
        this.createdAt = user.createdAt?.toISOString?.() || user.createdAt;
        this.updatedAt = user.updatedAt?.toISOString?.() || user.updatedAt;
        this.createdBy = user.createdBy || null;
        this.updatedBy = user.updatedBy || null;
        this.roles = user.userRoles?.map((userRole) => ({
            uuid: userRole.role.uuid,
            name: userRole.role.name,
            code: userRole.role.code,
            description: userRole.role.description,
        })) || [];
        this.role = this.roles[0] || null;
    }
    static collection(users) {
        return users.map((user) => new UserResource(user));
    }
    toJSON() {
        return {
            uuid: this.uuid,
            username: this.username,
            fullName: this.fullName,
            email: this.email,
            phone: this.phone,
            avatar: this.avatar,
            isActive: this.isActive,
            verifiedAt: this.verifiedAt,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy,
            roles: this.roles,
            role: this.roles[0] || null,
        };
    }
}
exports.UserResource = UserResource;
//# sourceMappingURL=user.resource.js.map