import { HttpException, HttpStatus } from '@nestjs/common';
import { CreateCategoryDto } from '../category/dto/create-category.dto';
import { CreateTagDto } from '../tag/dto/create-tag.dto';
import { Op } from 'sequelize';
import { UpdateCategoryDto } from '../category/dto/update-category.dto';
import { UpdateTagDto } from '../tag/dto/update-tag.dto';

type CreateFeatureDto = CreateCategoryDto | CreateTagDto;
type UpdateFeatureDto = UpdateCategoryDto | UpdateTagDto;

const attributes = new Map([
  ['category',  ['id', 'name', 'thumbnail', 'title', 'description']],
  ['tag',   ['id', 'name', 'title', 'description']]
])

export abstract class CategoryTagService {
  featureName: string = '';

  protected constructor(
    protected readonly featureRepository: any,
    protected readonly performerFeatureRepository: any,
  ) {}

  async getByName(name: string) {
    return await this.featureRepository.findOne({ where: { name } });
  }

  async addFeature(dto: CreateFeatureDto) {
    dto.url = await this.makeUrl(dto.name);

    try {
      const existing = await this.getByName(dto.name);

      if (existing) {
        return {
          status: HttpStatus.CONFLICT,
          message: `${this.featureName} "${dto.name}" already exists`,
        };
      }

      const { name, id } = await this.featureRepository.create(dto);

      return {
        status: HttpStatus.OK,
        message: `${this.featureName} added successfully`,
        name,
        id
      };
    } catch (error) {
      console.error(`addFeature: Failed to add ${this.featureName}`, error);
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: `Failed to create ${this.featureName}`,
      };
    }
  }

  async getNameList() {
    const features = await this.featureRepository.findAll({
      attributes: ['name'],
      order: [['name', 'ASC']],
      raw: true,
    });

    return features.map(f => f.name);
  }

  async setFeature(performerId: number, featureNames: string[]) {
    try {
      const assigned = await this.performerFeatureRepository.findAll({
        where: { performerId },
        include: {
          model: this.featureRepository,
          attributes: ['name'],
        },
      });

      const current = assigned
        .filter(item => item[this.featureName])
        .map(item => item[this.featureName].name);

      const toAdd = featureNames.filter(name => !current.includes(name));
      const toRemove = current.filter(name => !featureNames.includes(name));

      if (toAdd.length) {
        const features = await this.featureRepository.findAll({
          where: { name: toAdd },
        });

        const relations = features.map(feature => ({
          performerId,
          [`${this.featureName}Id`]: feature.id,
        }));

        await this.performerFeatureRepository.bulkCreate(relations);
      }

      if (toRemove.length) {
        const toRemoveIds = await this.featureRepository.findAll({
          where: { name: toRemove },
          attributes: ['id'],
        });

        await this.performerFeatureRepository.destroy({
          where: {
            performerId,
            [`${this.featureName}Id`]: toRemoveIds.map(f => f.id),
          },
        });
      }
    } catch (error) {
      console.error(`setFeature: Failed to update ${this.featureName}s`, error);
      throw new HttpException(`Failed to update ${this.featureName}s`, HttpStatus.NOT_FOUND);
    }
  }

  async getAllOrSearch(subStr: string = null, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    let where: any = {};

    if (subStr) {
      const fields = ['name', 'url', 'title', 'description', 'seoTitle', 'seoDescription', 'seoKeywords', 'seoH1'];

      where = {
        [Op.or]: fields.map(field => ({
          [field]: { [Op.iLike]: `%${subStr}%` },
        })),
      };
    }

    try {
      const { rows: entities, count } = await this.featureRepository.findAndCountAll({
        where,
        attributes:attributes.get(this.featureName),
        limit,
        offset,
        order: [['name', 'ASC']],
      });

      const totalPages = Math.ceil(count / limit);
      const currentPage = page > totalPages ? 1 : page;

      return {
        entities,
        meta: {
          itemCount: count,
          currentPage,
          totalPages,
        },
      };
    } catch (error) {
      console.error(`getAllOrSearch: ${this.featureName}s not found`, error);
      throw new HttpException(`Search failed`, HttpStatus.NOT_FOUND);
    }
  }

  async getForEdit(id: number) {
    return this.featureRepository.findOne({
      where: { id },
      attributes: { exclude: ['createdAt', 'updatedAt'] },
    });
  }

  async getById(id: number) {
    try {
      return await this.featureRepository.findOne({ where: { id } });
    } catch (error) {
      console.error(`getById ${this.featureName}`, id, error);
      throw new HttpException(`${this.featureName} not found`, HttpStatus.NOT_FOUND);
    }
  }

  async edit(id: number, dto: UpdateFeatureDto) {
    dto.url = await this.makeUrl(dto.name);

    try {
      const feature = await this.getById(id);

      Object.assign(feature, dto);
      await feature.save();

      return {
        status: HttpStatus.OK,
        message: 'Editing successful',
        id: feature.id,
      };
    } catch (error) {
      const message = error.errors?.[0]?.message || 'Edit error';
      console.error(`editFeature => ${message}`, error);
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  async delete(id: number) {
    const feature = await this.getById(id);

    await this.performerFeatureRepository.destroy({
      where: { [`${this.featureName}Id`]: id },
    });

    await this.featureRepository.destroy({ where: { id } });

    return {
      status: HttpStatus.OK,
      message: `${this.featureName} "${feature.name}" deleted successfully`,
    };
  }

  async makeUrl(text: string) {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s]+/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }
}
