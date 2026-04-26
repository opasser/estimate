import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CategoryMod } from './model/category.model';
import { CategoryPerformerModel } from './model/category-performer.model';
import { CategoryTagService } from '../shared/category-tag.abstract.service';

@Injectable()
export class CategoryService extends CategoryTagService {
  override featureName = 'category';

  constructor(
    @InjectModel(CategoryMod) private categoryRepository: typeof CategoryMod,
    @InjectModel(CategoryPerformerModel) private performerCategoryRepository: typeof CategoryPerformerModel,
  ) {
    super(categoryRepository, performerCategoryRepository)
  }

  async getList() {
    return await this.featureRepository.findAll({
      attributes: ['id', 'url', 'name', 'thumbnail'],
    });
  }

    async addCategoryThumbnail(id: number, imageUrl: string) {
      try {
        const category = await this.getById(id);

        category.thumbnail = imageUrl;

        await category.save();

        return {
          status: HttpStatus.OK,
          message: 'Category URL saved successfully',
          imageUrl,
        };
      } catch (error) {
        console.error('saveImage => Error processing images:', error);
        throw new Error('Error saving images');
      }
    }
}
