import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { AdminCreationAttr, AdminMod } from '../admin/model/admin.model';
import { CryptService } from '../crypt/crypt.service';

@Injectable()
export class AdminSeeder {
  constructor(
    @InjectModel(AdminMod) private adminModel: typeof AdminMod,
    protected readonly cryptService: CryptService,
  ) {}

  async run() {
    const password = await this.cryptService.getHashedPassword('bunny_admin');

    await this.createAdminIfNotExists({
      name: 'bunny_admin',
      email: 'admin@bunny.com',
      password,
    });
  }

  private async createAdminIfNotExists(adminData: AdminCreationAttr) {
    const [, created] = await this.adminModel.findOrCreate({
      where: { email: adminData.email },
      defaults: adminData,
    });

    if (created) {
      console.log(`***seeding: Admin ${adminData.name} created.***`);
    } else {
      console.log(`***seeding: Admin ${adminData.name} already exists.***`);
    }
  }
}
