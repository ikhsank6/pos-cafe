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
exports.PrismaService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const request_context_storage_1 = require("../common/context/request-context.storage");
let PrismaService = class PrismaService extends client_1.PrismaClient {
    extendedClient;
    constructor() {
        super();
        this.extendedClient = this.$extends({
            query: {
                $allModels: {
                    async create({ args, query }) {
                        const context = (0, request_context_storage_1.getRequestContext)();
                        const userName = context?.userName || 'System';
                        args.data = {
                            ...args.data,
                            createdBy: args.data.createdBy || userName,
                            updatedBy: args.data.updatedBy || userName,
                        };
                        return query(args);
                    },
                    async createMany({ args, query }) {
                        const context = (0, request_context_storage_1.getRequestContext)();
                        const userName = context?.userName || 'System';
                        if (Array.isArray(args.data)) {
                            args.data = args.data.map((item) => ({
                                ...item,
                                createdBy: item.createdBy || userName,
                                updatedBy: item.updatedBy || userName,
                            }));
                        }
                        return query(args);
                    },
                    async update({ args, query }) {
                        const context = (0, request_context_storage_1.getRequestContext)();
                        const userName = context?.userName || 'System';
                        if (args.data.deletedAt) {
                            args.data.deletedBy = userName;
                        }
                        else {
                            args.data.updatedBy = userName;
                        }
                        return query(args);
                    },
                    async updateMany({ args, query }) {
                        const context = (0, request_context_storage_1.getRequestContext)();
                        const userName = context?.userName || 'System';
                        if (args.data.deletedAt) {
                            args.data.deletedBy = userName;
                        }
                        else {
                            args.data.updatedBy = userName;
                        }
                        return query(args);
                    },
                    async upsert({ args, query }) {
                        const context = (0, request_context_storage_1.getRequestContext)();
                        const userName = context?.userName || 'System';
                        args.create = {
                            ...args.create,
                            createdBy: args.create.createdBy || userName,
                            updatedBy: args.create.updatedBy || userName,
                        };
                        args.update = {
                            ...args.update,
                            updatedBy: args.update.updatedBy || userName,
                        };
                        return query(args);
                    },
                },
            },
        });
        return new Proxy(this, {
            get: (target, prop, receiver) => {
                if (prop in target.extendedClient) {
                    return target.extendedClient[prop];
                }
                return Reflect.get(target, prop, receiver);
            },
        });
    }
    async onModuleInit() {
        await this.$connect();
    }
    async onModuleDestroy() {
        await this.$disconnect();
    }
};
exports.PrismaService = PrismaService;
exports.PrismaService = PrismaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PrismaService);
//# sourceMappingURL=prisma.service.js.map