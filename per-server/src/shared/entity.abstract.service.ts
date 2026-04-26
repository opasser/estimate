import {
  HttpException,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import { CryptService } from '../crypt/crypt.service';
import { RolesService } from '../roles/roles.service';
import { Op } from 'sequelize';

interface ICommonEntityWithPassword extends Omit<ICommonEntity, 'password'> {
  password: string;
}

export interface IPayload {
  id: number;
  email: string;
  role: string[];
  nickName?: string;
}

export interface IParsedTokenData extends IPayload{
  exp: number;
}

export interface ICommonEntity {
  email: string;
  name: string;
  id?: number;
  nickName?: string;
  password?: string;
  avatarUrl?: string;
  lastLogin?: string;
  isPublic?: boolean;
}

export interface ILoginEntity {
  email: string;
  password?: string;
}

export abstract class EntityService {
  protected ROLE: string;
  protected constructor(
    protected readonly repository: any,
    protected readonly cryptService: CryptService,
    protected readonly roleService: RolesService,
  ) {}

  private UNIQ_ENTITY_FIELDS = ['email', 'name', 'nickName'];
  private EDIT_ENTITY_FIELDS = [...this.UNIQ_ENTITY_FIELDS, 'paymentRate', 'c2cAmount', 'about', 'birthday', 'gender', 'bodyType', 'language', 'sexualOrientation'];

  async create<T>(dto: T) {
    return this.repository.create(dto);
  }

  async registration<T extends ICommonEntityWithPassword>(dto: T) {
    try {
      await this.checkUniqueFields(dto);

      const hashedPassword = await this.cryptService.getHashedPassword(
        dto.password,
      );
      const createdEntity = await this.create({
        ...dto,
        password: hashedPassword,
      });
      createdEntity.password = undefined;

      return {
        status: HttpStatus.OK,
        message: 'Registration successful',
        id: createdEntity.id,
      };
    }  catch (error) {
      console.error('registration =>', error);
      throw new HttpException(error || error.name, HttpStatus.BAD_REQUEST);
    }
  }

  async getBy(name: string, value: string) {
    return this.repository.findOne({
      where: { [ name ]: value },
    });
  }

  private async checkUniqueFields<T extends ICommonEntity>(dto: T) {
    for (const field of this.UNIQ_ENTITY_FIELDS) {
      if (dto[field]) {
        const candidate = await this.getBy(field, dto[field]);
        if (candidate) {
          throw new HttpException(
            `User with that ${field} already exists`,
            HttpStatus.BAD_REQUEST,
          );
        }
      }
    }
  }

  async getById(id: number) {
    return this.repository.findOne({
      where: { id },
      attributes: {
        exclude: ['password', 'lastLogin', 'updatedAt'],
      },
    });
  }

  async generateToken<T extends ICommonEntity>(entity: T, role: string) {
    const payload: IPayload = {
      id: entity.id,
      email: entity.email,
      role: [role],
      nickName: entity.nickName,
    };

    return this.cryptService.makeToken(payload);
  }

  async login<T extends ILoginEntity>(dto: T) {
    const { entity, role } = await this.validate(dto);
    await this.roleService.saveUserRole(entity.id, role);
    entity.lastLogin = new Date();
    await entity.save();
    return this.generateToken(entity, role.value);
  }

  private async validate<T extends ILoginEntity>(dto: T) {
    const sanitizedEmail = dto.email.trim().toLowerCase();
    const registeredEntity = await this.getBy('email', sanitizedEmail);

    if (!registeredEntity) {
      throw new UnauthorizedException({
        message: 'Invalid email or password',
        status: HttpStatus.UNAUTHORIZED,
      });
    }

    const passwordEquals = await this.cryptService.compare(
      dto.password,
      registeredEntity.password,
    );
    if (registeredEntity && passwordEquals) {
      const role = await this.roleService.getRoleByValue(this.ROLE);
      return { entity: registeredEntity, role: role };
    }

    throw new UnauthorizedException({
      message: 'Invalid email or password',
      status: HttpStatus.UNAUTHORIZED,
    });
  }

  async editEntity<T extends ICommonEntityWithPassword>(id: number, dto: T) {
    try {
      const entity = await this.getById(id);

      if (!entity) {
        throw new HttpException(`${this.ROLE} not found`, HttpStatus.NOT_FOUND);
      }

      const updateData: Partial<T> = {};

      [...this.EDIT_ENTITY_FIELDS, 'isPublic'].forEach((field) => {
        if (dto?.[field] !== entity[field]) {
          updateData[field] = dto[field];
        }
      });

      if (dto.password) {
        const hashedPassword = await this.cryptService.getHashedPassword(
          dto.password,
        );

        if (hashedPassword !== entity.password) {
          updateData.password = hashedPassword;
        }
      }

      if (Object.keys(updateData).length > 0) {
        await entity.update(updateData);
      }

      return {
        status: HttpStatus.OK,
        message: 'Editing successful',
        id: entity.id,
      };
    } catch (error) {
      const message = error.errors[0]?.message || 'Validation error';
      console.error('editEntity =>', message, error);
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  async delete(id: number) {
    const entity = await this.getById(id);

    if (!entity) {
      throw new HttpException(`${this.ROLE} not found`, HttpStatus.NOT_FOUND);
    }

    await entity.destroy();

    return {
      status: HttpStatus.OK,
      message: `${this.ROLE} deleted successfully`,
    };
  }

  async getAllOrSearch(
    subStr: string = null,
    page: number = 1,
    limit: number = 10,
  ) {
    const offset = (page - 1) * limit;

    let whereCondition: any = {};

    if (subStr) {
      whereCondition = {
        [Op.or]: [
          { email: { [Op.iLike]: `%${subStr}%` } },
          { name: { [Op.iLike]: `%${subStr}%` } },
          this.ROLE === 'performer' && { nickName: { [Op.iLike]: `%${subStr}%` },
          },
        ],
      };

      const idAsNumber = Number(subStr);
      if (!isNaN(idAsNumber)) {
        whereCondition[Op.or].unshift({ id: { [Op.eq]: idAsNumber } });
      }
    }
    const attrPer = [
      'id',
      'name',
      'nickName',
      'email',
      'isPublic',
      'avatarUrl',
      'lastLogin',
      'createdAt',
      'updatedAt',
      'paymentRate',
      'c2cAmount'
    ];
    const attrAdm = [
      'id',
      'name',
      'email',
      'lastLogin',
      'createdAt',
      'updatedAt',
    ];
    const attributes = this.ROLE === 'performer' ? attrPer : attrAdm;

    try {
      const { rows: entities, count: totalItems } =
        await this.repository.findAndCountAll({
          where: whereCondition,
          attributes: attributes,
          limit,
          offset,
          order: [['id', 'DESC']],
        });

      const totalPages = Math.ceil(totalItems / limit);
      const currentPage = page > totalPages ? 1 : page;

      return {
        entities,
        meta: {
          itemCount: totalItems,
          currentPage: currentPage,
          totalPages: totalPages,
        },
      };
    } catch (error) {
      console.error(`getAllOrSearch => Search: ${subStr} not found`, error);
      throw new HttpException(
        `Search: ${subStr} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
