import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CryptService } from '../../crypt/crypt.service';
import { PerformerMod } from '../model/performer.model';
import { EntityService } from '../../shared/entity.abstract.service';
import { RolesService } from '../../roles/roles.service';
import { QueryTypes } from 'sequelize';

@Injectable()
export class PerformerService extends EntityService {
  ROLE = 'performer';
  constructor(
    @InjectModel(PerformerMod) private performerRepository: typeof PerformerMod,
    cryptService: CryptService,
    roleService: RolesService,
  ) { super(performerRepository, cryptService, roleService) }

  async getPerformerForEdit(id: number) {
    try {
      const query = `
          SELECT p.id,
                 p."isPublic",
                 p."name",
                 p."nickName",
                 p."email",
                 p."avatarUrl",
                 p."paymentRate",
                 p."c2cAmount",
                 p."birthday",
                 p."language",
                 p."gender",
                 p."about",
                 p."bodyType",
                 p."sexualOrientation",
                 COALESCE(
                   ARRAY_AGG(DISTINCT c.name ORDER BY c.name)
                   FILTER (WHERE c.name IS NOT NULL),
                   '{}'
                 ) AS category,
                 COALESCE(
                   ARRAY_AGG(DISTINCT t.name ORDER BY t.name)
                   FILTER (WHERE t.name IS NOT NULL),
                   '{}'
                 ) AS tag
          FROM performers p
                   LEFT JOIN "category-performer" cp ON cp."performerId" = p.id
                   LEFT JOIN categories c ON c.id = cp."categoryId"
                   LEFT JOIN "tag-performer" tp ON tp."performerId" = p.id
                   LEFT JOIN tags t ON t.id = tp."tagId"
          WHERE p.id = :id
          GROUP BY p.id;
      `;

      const [result] = await this.performerRepository.sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements: { id },
      });

      return result;
    } catch (error) {
      console.error('getPerformerForEdit =>', error)
      throw new HttpException('Resource not found', HttpStatus.NOT_FOUND);
    }
  }

  async addAvatarUrl(id: number, imageUrl: string) {
    const entity = await this.getById(id);

    if (!entity) {
      throw new HttpException(
        `${this.ROLE} ${entity.id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    entity.avatarUrl = imageUrl;
    await entity.save();

    return {
      status: HttpStatus.OK,
      message: 'Avatar URL saved successfully',
      imageUrl,
    };
  }
}
