import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as sharp from 'sharp';
import { ConfigService } from '@nestjs/config';
import { ImageCreationAttr, ImageMod } from '../model/image.model';
import { InjectModel } from '@nestjs/sequelize';
import { ChangeImageOrderDto, CreateImageDto } from '../dto/image.dto';

@Injectable()
export class ImageService {
  constructor(
    private configService: ConfigService,
    @InjectModel(ImageMod) private readonly imageModel: typeof ImageMod,
  ) {}

  async saveImage(id: number, file: Express.Multer.File, imageType: string) {
    const uploadPath = path.join(process.cwd(), 'assets', 'performers', `${id}`, imageType );
    const fileName = `${imageType.slice(0, 4)}-${id}-${Date.now()}.webp`;
    const outputFile = path.join(uploadPath, fileName);

    try {
      await fs.promises.mkdir(uploadPath, { recursive: true });
      if (imageType === 'avatar') {
        const existingFiles = await fs.promises.readdir(uploadPath);

        for (const oldFile of existingFiles) {
          await fs.promises.unlink(path.join(uploadPath, oldFile));
        }
      }

      const height = `${imageType.toUpperCase()}_H`;
      const width = `${imageType.toUpperCase()}_W`;

      const configHeight = this.configService.get<number>(height);
      const configWidth = this.configService.get<number>(width);

      const resizedImage = await sharp(file.buffer)
        .resize({
          width: Number(configWidth),
          height: Number(configHeight),
          fit: 'inside',
        })
        .toFormat('webp')
        .toFile(outputFile);

      return {
        path: `/assets/performers/${id}/${imageType}/${fileName}`,
        height: resizedImage.height,
        width: resizedImage.width,
      };
    } catch (error) {
      console.error('saveImage => Error processing images:', error);
      throw new Error('Error saving images');
    }
  }

  async saveCategoryImage(id: number, file: Express.Multer.File) {
    const uploadPath = path.join(process.cwd(), 'assets', 'category', `${id}`);
    const fileName = `cat-${id}.webp`;
    const outputFile = path.join(uploadPath, fileName);

    try {
      await fs.promises.mkdir(uploadPath, { recursive: true });

      const resizedImage = await sharp(file.buffer)
        .resize({
          width: +this.configService.get<number>('CATEGORY_W'),
          height: +this.configService.get<number>('CATEGORY_H'),
          fit: 'inside',
        })
        .toFormat('webp')
        .toFile(outputFile);

      return {
        path: `/assets/category/${id}/${fileName}`,
        height: resizedImage.height,
        width: resizedImage.width,
      };
    } catch (error) {
      console.error('saveCategoryImage => Error processing image:', error);
      throw new Error('Error saving category image');
    }
  }

  async saveBannerImg(id: number, file: Express.Multer.File) {
    const uploadPath = path.join(process.cwd(), 'assets', 'banners', `${id}`);
    const fileName = `ban-${id}.webp`;
    const outputFile = path.join(uploadPath, fileName);

    try {
      await fs.promises.mkdir(uploadPath, { recursive: true });
      const image = await sharp(file.buffer);
      const metadata = await image.metadata();
      await image.toFormat('webp').toFile(outputFile);

      return {
        imgPath: `/assets/banners/${id}/${fileName}`,
        imgW: metadata.width,
        imgH: metadata.height,
      };
    } catch (error) {
      console.error('saveBannerImg => Error saving banner:', error);
      throw new Error('Error saving banner image');
    }
  }



  parseToMap(data: string[] | string) {
    const dataArr = typeof data === 'string' ? [data] : data;
    return dataArr.reduce((calc: Map<string, number>, cur: string) => {
      const [fileName, orderIndex] = JSON.parse(cur);
      calc.set(fileName, orderIndex);
      return calc;
    }, new Map<string, number>());
  }

  async savePortfolio(
    id: number,
    files: Express.Multer.File[],
    orderMap: Map<string, number>,
  ) {
    try {
      for (const file of files) {
        const dataImage = {
          performerId: Number(id),
          order: orderMap.get(file.originalname),
        } as ImageCreationAttr;

        const [portfolioData, thumbnailData] = await Promise.all([
          this.saveImage(id, file, 'portfolio'),
          this.saveImage(id, file, 'thumbnail'),
        ]);

        dataImage.imagePath = portfolioData.path;
        dataImage.imgH = portfolioData.height;
        dataImage.imgW = portfolioData.width;

        dataImage.thumbnailPath = thumbnailData.path;
        dataImage.thumbH = thumbnailData.height;
        dataImage.thumbW = thumbnailData.width;

        await this.saveDataImage(dataImage);
      }
      return {
        status: HttpStatus.OK,
        message: 'All images saved successfully',
      };
    } catch (error) {
      console.error('savePortfolio => Error processing images:', error);

      throw new HttpException(
        `Failed to save portfolio images: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async saveDataImage(dataImage: CreateImageDto) {
    try {
      await this.imageModel.create(dataImage);
    } catch (error) {
      console.error('saveDataImage => Error processing images:', error);
      throw new Error(`Failed to save image: ${error.message}`);
    }
  }

  async getGalleryById(id: number) {
    return await ImageMod.findAll({
      attributes: [
        'id',
        'performerId',
        'thumbnailPath',
        'order',
        'thumbH',
        'thumbW',
        'imagePath',
      ],
      where: { performerId: id },
      order: [['order', 'ASC']],
    });
  }

  async deleteImageById(performerId: number, pictureId: number) {
    try {
      const image = await this.imageModel.findOne({
        where: {
          performerId,
          id: pictureId,
        },
      });

      if (!image) {
        throw new Error(
          `Image with id ${pictureId} not found for performer ${performerId}`,
        );
      }

      if (image.imagePath) {
        await this.deleteFile(image.imagePath);
      }
      if (image.thumbnailPath) {
        await this.deleteFile(image.thumbnailPath);
      }

      await image.destroy();

      return {
        status: HttpStatus.OK,
        message: `Image with id ${pictureId} deleted successfully.`,
      };
    } catch (error) {
      console.error('deleteImageById => Error deleting image:', error);

      throw new HttpException(
        `Failed to delete image: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async deleteFile(filePath: string) {
    const absolutePath = path.join(process.cwd(), filePath);
    try {
      await fs.promises.unlink(absolutePath);
    } catch (error) {
      console.error(`deleteFile => Error deleting file ${absolutePath}:`,
        error,
      );
    }
  }

  async deleteAssetsImg(filePath: string) {
    const absolutePath = path.join(process.cwd(), filePath);
    const folderPath = path.dirname(absolutePath);

    try {
      await fs.promises.unlink(absolutePath);
      await fs.promises.rm(folderPath, { recursive: true, force: true });
    } catch (error) {
      console.error(`deleteCategoryImage => Error deleting file ${absolutePath}:`,
        error,
      );
    }
  }

  async deletePerformerAssets(id: number) {
    const folderPath = path.join(process.cwd(), 'assets', 'performers', `${id}`);

    try {
      await fs.promises.rm(folderPath, { recursive: true, force: true });
    } catch (error) {
      console.error(`deletePerformerAssets ${id}:`, error);
      throw error;
    }
  }

  async updatePortfolioOrder(
    performerId: number,
    newOrder: ChangeImageOrderDto[],
  ) {
    try {
      const transaction = await this.imageModel.sequelize.transaction();

      try {
        for (const image of newOrder) {
          await this.imageModel.update(
            { order: image.order },
            {
              where: { id: image.id, performerId },
              transaction,
            },
          );
        }

        await transaction.commit();
        return {
          status: HttpStatus.OK,
          message: 'Portfolio order updated successfully',
        };
      } catch (error) {
        await transaction.rollback();
        console.error(
          'updatePortfolioOrder => Error updating portfolio order:',
          error,
        );
        throw new HttpException(
          `Failed to update portfolio order: ${error.message}`,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } catch (error) {
      console.error('updatePortfolioOrder => Transaction error:', error);
      throw new HttpException(
        `Transaction error: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
