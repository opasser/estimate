import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './controller/category.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { CategoryMod } from './model/category.model';
import { CategoryPerformerModel } from './model/category-performer.model';


@Module({
  controllers: [CategoryController],
  providers: [CategoryService],
  imports: [SequelizeModule.forFeature([CategoryMod, CategoryPerformerModel])],
  exports: [CategoryService]
})
export class CategoryModule {}
