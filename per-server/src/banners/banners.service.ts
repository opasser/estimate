import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BannerMod } from './model/banner.model';
import { literal, Op, QueryTypes } from 'sequelize';
import { BannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannersService  {
  constructor(
    @InjectModel(BannerMod) private bannerRepository: typeof BannerMod
  ) {}

  async geForEdit(id: number) {
    try {
      return this.bannerRepository.findOne({
        where: { id },
        attributes: { exclude: ['createdAt', 'updatedAt'] },
      });
    } catch (error) {
      console.error(`geForEdit banner`, id, error);
      throw new HttpException(`Banner not found`, HttpStatus.NOT_FOUND);
    }
  }

  async getAllOrSearch(subStr: string = null, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    let whereCondition: any = {};

    if (subStr) {
      const escapedSubStr = subStr.replace(/'/g, "''");

      whereCondition = {
        [Op.and]: [
          literal(`
            CAST("BannerMod"."section" AS TEXT) ILIKE '%${escapedSubStr}%' OR
            CAST("BannerMod"."scope" AS TEXT) ILIKE '%${escapedSubStr}%' OR
            "BannerMod"."url" ILIKE '%${escapedSubStr}%' OR
            "BannerMod"."alt" ILIKE '%${escapedSubStr}%'
          `),
        ],
      };
    }

    try {
      const { rows: entities, count: totalItems } =
        await this.bannerRepository.findAndCountAll({
          where: whereCondition,
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
          currentPage,
          totalPages,
        },
      };
    } catch (error) {
      console.error(`getAllOrSearch => Search: ${subStr} not found:`, error);
      throw new HttpException(
        `Search: ${subStr} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async registration(banner: BannerDto) {
    try {
      const { id } = await this.bannerRepository.create({ ...banner });

      return { id };
    } catch (error) {
      console.error('registerBanner => Error while saving banner data:', error);

      throw new HttpException(
        'Failed to register banner.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async edit(id: number, dto: UpdateBannerDto) {
    try {
      await this.bannerRepository.update(dto, { where: { id } });

      return {
        status: HttpStatus.OK,
        message: 'Editing successful',
        id,
      };
    } catch (error) {
      const message = error.errors?.[0]?.message || 'Edit error';
      console.error(`addMetaData => ${message}`, error);
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  async delete(id: number) {
    try {
      await this.bannerRepository.destroy({ where: { id } });

      return {
        status: HttpStatus.OK,
        message: `Banner "${id}" deleted successfully`,
      };
    } catch (error) {
      const message = error.errors?.[0]?.message || 'Delete banner image error';
      console.error(`delete => ${message}`, error);
      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }
  }

  async getAll(section: string[] = []) {
    const replacements: any = {};
    let whereClause = '';

    try {
      if (section.length) {
        replacements.sections = `{${section.join(',')}}`;
        whereClause = 'WHERE section = ANY(:sections)';
      }

      const query = `
          SELECT json_object_agg(section, banners) AS grouped
          FROM (
                 SELECT
                     section,
                     json_agg(json_build_object(
                                'id', id,
                                'section', section,
                                'scope', scope,
                                'url', url,
                                'alt', alt,
                                'imgPath', "imgPath",
                                'imgH', "imgH",
                                'imgW', "imgW",
                                'locale', "locale"
                    ) ORDER BY id DESC) AS banners
                 FROM banners
                          ${whereClause}
                 GROUP BY section
         ) AS sub
      `;


      const [res] = await this.bannerRepository.sequelize.query(query, {
        type: QueryTypes.SELECT,
        replacements,
      });

      return res;
    } catch (error) {
      console.error(`getAll => Get all banners error`, error);
      throw new HttpException(`Get all banners error`, HttpStatus.BAD_REQUEST);
    }
  }


}
