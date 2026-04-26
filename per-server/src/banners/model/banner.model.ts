import { Column, DataType, Model, Table } from 'sequelize-typescript';

export interface BannerCreationAttr {
  scope: 'all' | 'preview' | 'member';
  section: 'index-top' | 'index-mid' | 'index-bottom' | 'custom';
  url: string;
  imgH: number;
  imgW: number;
  imgPath: string;
  alt?: string;
  locale: string;
}

@Table({tableName: 'banners', timestamps: true})
export class BannerMod extends Model<BannerMod, BannerCreationAttr> {
  @Column({ type: DataType.INTEGER, autoIncrement: true, primaryKey: true })
  id: number;

  @Column({ type: DataType.ENUM('all', 'preview', 'member'), allowNull: false })
  scope: 'all' | 'preview' | 'member';

  @Column({
      type: DataType.ENUM('index-top', 'index-mid', 'index-bottom', 'custom'),
      allowNull: false
    }
  )
  section: 'index-top' | 'index-mid' | 'index-bottom' | 'custom';

  @Column({ type: DataType.STRING })
  url: string;

  @Column({ type: DataType.STRING })
  alt: string;

  @Column({ type: DataType.STRING })
  imgPath: string;

  @Column({ type: DataType.NUMBER })
  imgH: number;

  @Column({ type: DataType.NUMBER })
  imgW: number;

  @Column({ type: DataType.STRING })
  locale: string;
}
