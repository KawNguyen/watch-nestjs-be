import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './modules/user/user.module';
import { MovementModule } from './modules/movement/movement.module';
import { MaterialModule } from './modules/material/material.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { OrderModule } from './modules/order/order.module';
import { StockEntryModule } from './modules/stock-entry/stock-entry.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { ReviewModule } from './modules/review/review.module';
import { CouponModule } from './modules/coupon/coupon.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AddressModule } from './modules/address/address.module';
import { AdvertisementModule } from './modules/advertisement/advertisement.module';
import { AuthModule } from './modules/auth/auth.module';
import { BandMaterialModule } from './modules/band-material/band-material.module';
import { BrandModule } from './modules/brand/brand.module';
import { CartModule } from './modules/cart/cart.module';
import { CloudinaryModule } from './modules/cloudinary/cloudinary.module';
import { WatchModule } from './modules/watch/watch.module';
import { NotificationModule } from './modules/notification/notification.module';
import { BlogModule } from './modules/blog/blog.module';
import { MailModule } from './modules/mail/mail.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ReturnRequestModule } from './modules/return-request/return-request.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    BrandModule,
    MaterialModule,
    BandMaterialModule,
    MovementModule,
    WatchModule,
    FavoriteModule,
    CartModule,
    OrderModule,
    StockEntryModule,
    InventoryModule,
    ReviewModule,
    CouponModule,
    AdvertisementModule,
    CloudinaryModule,
    AddressModule,
    PaymentsModule,
    NotificationModule,
    BlogModule,
    MailModule,
    DashboardModule,
    ReturnRequestModule,
  ],
})
export class AppModule {}
