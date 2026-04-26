import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CategoryTagService } from '../shared/category-tag.abstract.service';
import { TagMod } from './model/tag.model';
import { TagPerformerModel } from './model/tag-performer.model';

@Injectable()
export class TagService extends CategoryTagService {
  override featureName = 'tag';

  constructor(
    @InjectModel(TagMod) private categoryRepository: typeof TagMod,
    @InjectModel(TagPerformerModel) private performerCategoryRepository: typeof TagPerformerModel,
  ) {
    super(categoryRepository, performerCategoryRepository)
  }
}
