import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { LoggerModule } from './logger/logger.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { MenusModule } from './modules/menus/menus.module';
import { MenuAccessModule } from './modules/menu-access/menu-access.module';
import { EmailModule } from './modules/email/email.module';
import { QueueModule } from './modules/queue/queue.module';
import { UploadModule } from './upload/upload.module';
import { MediaModule } from './media/media.module';
import { ProfileModule } from './modules/profile/profile.module';

// Cafe POS Modules
import { CategoriesModule } from './modules/categories/categories.module';
import { ProductsModule } from './modules/products/products.module';
import { TablesModule } from './modules/tables/tables.module';
import { CustomersModule } from './modules/customers/customers.module';
import { DiscountsModule } from './modules/discounts/discounts.module';
import { OrdersModule } from './modules/orders/orders.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';

import { RequestContextInterceptor } from './common/interceptors/request-context.interceptor';
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    LoggerModule,
    EmailModule,
    QueueModule,
    AuthModule,
    UsersModule,
    RolesModule,
    MenusModule,
    MenuAccessModule,
    UploadModule,
    MediaModule,
    ProfileModule,
    // Cafe POS Modules
    CategoriesModule,
    ProductsModule,
    TablesModule,
    CustomersModule,
    DiscountsModule,
    OrdersModule,
    TransactionsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestContextInterceptor,
    },
  ],
})
export class AppModule { }
