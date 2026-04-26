import { Injectable } from '@nestjs/common';
import { AdminMod } from '../model/admin.model';
import { InjectModel } from '@nestjs/sequelize';
import { CryptService } from '../../crypt/crypt.service';
import { EntityService } from '../../shared/entity.abstract.service';
import { RolesService } from '../../roles/roles.service';

@Injectable()
export class AdminService extends EntityService {
  ROLE = 'admin';

  constructor(
    @InjectModel(AdminMod) private adminRepository: typeof AdminMod,
    cryptService: CryptService,
    roleService: RolesService,
  ) {
    super(adminRepository, cryptService, roleService);
  }
}
