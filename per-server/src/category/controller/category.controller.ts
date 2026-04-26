import { Controller, Get } from '@nestjs/common';
import { CategoryService } from '../category.service';

@Controller('/categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('')
  getCategoryList() {
    return this.categoryService.getList();
  }

  @Get('/names-list')
  getCategoryNameList() {
    return this.categoryService.getNameList();
  }
}
