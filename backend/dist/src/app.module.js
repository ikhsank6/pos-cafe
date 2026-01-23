"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const prisma_module_1 = require("./prisma/prisma.module");
const logger_module_1 = require("./logger/logger.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const roles_module_1 = require("./modules/roles/roles.module");
const menus_module_1 = require("./modules/menus/menus.module");
const menu_access_module_1 = require("./modules/menu-access/menu-access.module");
const email_module_1 = require("./modules/email/email.module");
const queue_module_1 = require("./modules/queue/queue.module");
const upload_module_1 = require("./upload/upload.module");
const media_module_1 = require("./media/media.module");
const profile_module_1 = require("./modules/profile/profile.module");
const categories_module_1 = require("./modules/categories/categories.module");
const products_module_1 = require("./modules/products/products.module");
const tables_module_1 = require("./modules/tables/tables.module");
const customers_module_1 = require("./modules/customers/customers.module");
const discounts_module_1 = require("./modules/discounts/discounts.module");
const orders_module_1 = require("./modules/orders/orders.module");
const transactions_module_1 = require("./modules/transactions/transactions.module");
const request_context_interceptor_1 = require("./common/interceptors/request-context.interceptor");
const app_controller_1 = require("./app.controller");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            prisma_module_1.PrismaModule,
            logger_module_1.LoggerModule,
            email_module_1.EmailModule,
            queue_module_1.QueueModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            roles_module_1.RolesModule,
            menus_module_1.MenusModule,
            menu_access_module_1.MenuAccessModule,
            upload_module_1.UploadModule,
            media_module_1.MediaModule,
            profile_module_1.ProfileModule,
            categories_module_1.CategoriesModule,
            products_module_1.ProductsModule,
            tables_module_1.TablesModule,
            customers_module_1.CustomersModule,
            discounts_module_1.DiscountsModule,
            orders_module_1.OrdersModule,
            transactions_module_1.TransactionsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: request_context_interceptor_1.RequestContextInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map