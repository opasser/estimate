import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CryptService } from '../crypt/crypt.service';
import { PerformerMod } from '../performer/model/performer.model';

@Injectable()
export class PerformerSeeder {
  constructor(
    @InjectModel(PerformerMod) private adminModel: typeof PerformerMod,
    protected readonly cryptService: CryptService,
  ) {}

  async run() {
    const password =
      await this.cryptService.getHashedPassword('bunny_performer');

    await this.createAdminIfNotExists({
      name: 'bunny_performer',
      email: 'performer@bunny.com',
      nickName: 'bunny_performer',
      isPublic: false,
      password,
    });
  }

  private async createAdminIfNotExists(performerData: {
    password: string;
    nickName: string;
    name: string;
    isPublic: boolean;
    email: string;
  }) {
    const [, created] = await this.adminModel.findOrCreate({
      where: { email: performerData.email },
      defaults: performerData,
    });

    if (created) {
      console.log(`***Performer ${performerData.name} created.***`);
    } else {
      console.log(
        `***seeding: Performer ${performerData.name} already exists.***`,
      );
    }
  }
}
