"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MenuResource = void 0;
class MenuResource {
    uuid;
    name;
    path;
    icon;
    order;
    isActive;
    createdAt;
    updatedAt;
    createdBy;
    updatedBy;
    parent;
    children;
    constructor(menu) {
        this.uuid = menu.uuid;
        this.name = menu.name;
        this.path = menu.path || null;
        this.icon = menu.icon || null;
        this.order = menu.order;
        this.isActive = menu.isActive;
        this.createdAt = menu.createdAt?.toISOString?.() || menu.createdAt;
        this.updatedAt = menu.updatedAt?.toISOString?.() || menu.updatedAt;
        this.createdBy = menu.createdBy || null;
        this.updatedBy = menu.updatedBy || null;
        if (menu.parent !== undefined) {
            this.parent = menu.parent
                ? {
                    uuid: menu.parent.uuid,
                    name: menu.parent.name,
                }
                : null;
        }
        if (menu.children) {
            this.children = MenuResource.collection(menu.children);
        }
    }
    static collection(menus) {
        return menus.map((menu) => new MenuResource(menu));
    }
    toJSON() {
        const result = {
            uuid: this.uuid,
            name: this.name,
            path: this.path,
            icon: this.icon,
            order: this.order,
            isActive: this.isActive,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            createdBy: this.createdBy,
            updatedBy: this.updatedBy,
        };
        if (this.parent !== undefined) {
            result.parent = this.parent;
        }
        if (this.children !== undefined) {
            result.children = this.children.map((c) => c.toJSON());
        }
        return result;
    }
}
exports.MenuResource = MenuResource;
//# sourceMappingURL=menu.resource.js.map