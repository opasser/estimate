import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { AdminSeeder } from './seeders/admin.seeder';
import { RoleSeeder } from './seeders/roles.seeder';
import { join } from 'path';
import { PerformerSeeder } from './seeders/performer.seeder';

@Injectable()
export class AppService implements OnApplicationBootstrap {
  constructor(
    private adminSeeder: AdminSeeder,
    private roleSeeder: RoleSeeder,
    private performerSeeder: PerformerSeeder,
  ) {}

  getAppPath(): string {
    return join(process.cwd(), '..', 'per-client/client/browser', 'index.html');
  }

  async onApplicationBootstrap() {
    await this.adminSeeder.run();
    await this.roleSeeder.run();
    await this.performerSeeder.run();
  }
}
