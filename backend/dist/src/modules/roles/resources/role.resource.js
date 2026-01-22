"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleResource = void 0;
class RoleResource {
    uuid;
    name;
    code;
    description;
    isActive;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
    menuAccess;
    constructor(role) {
        this.uuid = role.uuid;
        this.name = role.name;
        this.code = role.code;
        this.description = role.description || null;
        this.isActive = role.isActive;
        this.createdAt = role.createdAt?.toISOString?.() || role.createdAt;
        this.updatedAt = role.updatedAt?.toISOString?.() || role.updatedAt;
        this.createdBy = role.createdBy || null;
        this.updatedBy = role.updatedBy || null;
        if (role.menuAccess) {
            this.menuAccess = role.menuAccess.map((access) => ({
                uuid: access.uuid,
                menu: access.menu
                    ? {
                        uuid: access.menu.uuid,
                        name: access.menu.name,
                        path: access.menu.path,
                        icon: access.menu.icon,
                        order: access.menu.order,
                        isActive: access.menu.isActive,
                    }
                    : null,
            }));
        }
    }
    static collection(roles) {
        return roles.map((role) => new RoleResource(role));
    }
    toJSON() {
        const result = {
            uuid: this.uuid,
            name: this.name,
            code: this.code,
            description: this.description,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy,
        };
        if (this.menuAccess !== undefined) {
            result.menuAccess = this.menuAccess;
        }
        return result;
    }
}
exports.RoleResource = RoleResource;
//# sourceMappingURL=role.resource.js.map