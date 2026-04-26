import { Module } from '@nestjs/common';
import { AdminService } from './service/admin.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { AdminMod } from './model/admin.model';
import { CryptModule } from '../crypt/crypt.module';
import { AdminLoginController } from './controller/admin-login.controller';
import { RolesModule } from '../roles/roles.module';
import { RoleMod } from '../roles/model/roles.model';
import { UserRoleMod } from '../roles/model/user-roles.model';
import { PerformerModule } from '../performer/performer.module';
import { MemberModule } from '../member/member.module';
import { ImageModule } from '../image/image.module';
import { PaymentModule } from '../payment/payment.module';
import { CategoryModule } from '../category/category.module';
import { PerformerTableController } from './controller/performer-table.controller';
import { AdminTableController } from './controller/admin-table.controller';
import { PaymentTableController } from './controller/payment-table.controller';
import { MemberTableController } from './controller/member-table.controller';
import { StreamTableController } from './controller/stream-table.controller';
import { ChatModule } from '../chat/chat.module';
import { CategoriesTableController } from './controller/category-table.controller';
import { TagModule } from '../tag/tag.module';
import { TagsTableController } from './controller/tag-table.controller';
import { BannersTableController } from './controller/banners-table.controller';
import { BannersModule } from '../banners/banners.module';


@Module({
  providers: [AdminService],
  controllers: [
    AdminLoginController,
    AdminTableController,
    PerformerTableController,
    MemberTableController,
    StreamTableController,
    PaymentTableController,
    CategoriesTableController,
    TagsTableController,
    BannersTableController
  ],
  imports: [
    SequelizeModule.forFeature([AdminMod, RoleMod, UserRoleMod]),
    CryptModule,
    RolesModule,
    PerformerModule,
    MemberModule,
    ImageModule,
    PaymentModule,
    ChatModule,
    CategoryModule,
    TagModule,
    BannersModule,
  ],
})
export class AdminModule {}
