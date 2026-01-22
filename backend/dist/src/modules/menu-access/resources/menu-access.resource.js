"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuAccessResource = void 0;
class MenuAccessResource {
    uuid;
    createdAt;
    updatedAt;
    role;
    menu;
    constructor(menuAccess) {
        this.uuid = menuAccess.uuid;
        this.createdAt = menuAccess.createdAt?.toISOString?.() || menuAccess.createdAt;
        this.updatedAt = menuAccess.updatedAt?.toISOString?.() || menuAccess.updatedAt;
        if (menuAccess.role) {
            this.role = {
                uuid: menuAccess.role.uuid,
                name: menuAccess.role.name,
            };
        }
        if (menuAccess.menu) {
            this.menu = {
                uuid: menuAccess.menu.uuid,
                name: menuAccess.menu.name,
                path: menuAccess.menu.path,
                icon: menuAccess.menu.icon,
                order: menuAccess.menu.order,
                isActive: menuAccess.menu.isActive,
            };
        }
    }
    static collection(menuAccessList) {
        return menuAccessList.map((ma) => new MenuAccessResource(ma));
    }
    toJSON() {
        const result = {
            uuid: this.uuid,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        };
        if (this.role !== undefined) {
            result.role = this.role;
        }
        if (this.menu !== undefined) {
            result.menu = this.menu;
        }
        return result;
    }
}
exports.MenuAccessResource = MenuAccessResource;
//# sourceMappingURL=menu-access.resource.js.map