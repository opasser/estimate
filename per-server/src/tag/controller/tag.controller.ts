import { Controller, Get } from '@nestjs/common';
import { TagService } from '../tag.service';


@Controller('/tags')
export class TagController {
  constructor(private readonly categoryService: TagService) {}

  @Get('/names-list')
  getTagNameList() {
    return this.categoryService.getNameList();
  }
}
