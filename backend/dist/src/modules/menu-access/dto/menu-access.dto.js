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
exports.MenuAccessItemDto = exports.BulkMenuAccessDto = exports.UpdateMenuAccessDto = exports.CreateMenuAccessDto = void 0;
const class_validator_1 = require("class-validator");
class CreateMenuAccessDto {
    roleUuid;
    menuUuid;
}
exports.CreateMenuAccessDto = CreateMenuAccessDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'roleUuid harus diisi.' }),
    (0, class_validator_1.IsUUID)('4', { message: 'roleUuid harus berupa UUID.' }),
    __metadata("design:type", String)
], CreateMenuAccessDto.prototype, "roleUuid", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'menuUuid harus diisi.' }),
    (0, class_validator_1.IsUUID)('4', { message: 'menuUuid harus berupa UUID.' }),
    __metadata("design:type", String)
], CreateMenuAccessDto.prototype, "menuUuid", void 0);
class UpdateMenuAccessDto {
    menuUuid;
}
exports.UpdateMenuAccessDto = UpdateMenuAccessDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'menuUuid harus diisi.' }),
    (0, class_validator_1.IsUUID)('4', { message: 'menuUuid harus berupa UUID.' }),
    __metadata("design:type", String)
], UpdateMenuAccessDto.prototype, "menuUuid", void 0);
class BulkMenuAccessDto {
    roleUuid;
    menuUuids;
}
exports.BulkMenuAccessDto = BulkMenuAccessDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'roleUuid harus diisi.' }),
    (0, class_validator_1.IsUUID)('4', { message: 'roleUuid harus berupa UUID.' }),
    __metadata("design:type", String)
], BulkMenuAccessDto.prototype, "roleUuid", void 0);
__decorate([
    (0, class_validator_1.IsArray)({ message: 'menuUuids harus array.' }),
    (0, class_validator_1.IsUUID)('4', { each: true, message: 'Setiap item harus berupa UUID.' }),
    __metadata("design:type", Array)
], BulkMenuAccessDto.prototype, "menuUuids", void 0);
class MenuAccessItemDto {
    menuUuid;
}
exports.MenuAccessItemDto = MenuAccessItemDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'menuUuid harus diisi.' }),
    (0, class_validator_1.IsUUID)('4', { message: 'menuUuid harus berupa UUID.' }),
    __metadata("design:type", String)
], MenuAccessItemDto.prototype, "menuUuid", void 0);
//# sourceMappingURL=menu-access.dto.js.map