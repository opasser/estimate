import { Column, DataType, Table, Model, HasMany, BelongsToMany } from 'sequelize-typescript';
import { StreamMod } from './stream.model';
import { CategoryMod } from '../../category/model/category.model';
import { CategoryPerformerModel } from '../../category/model/category-performer.model';
import { TagMod } from '../../tag/model/tag.model';
import { TagPerformerModel } from '../../tag/model/tag-performer.model';

export interface PerCreationAttr {
  name: string;
  nickName: string;
  email: string;
  password: string;
  isPublic: boolean;
  avatarUrl?: string;
  paymentRate: number;
  c2cAmount: number;
  about?: string;
  birthday?: Date;
  gender?: string;
  bodyType?: string;
  language?: string[];
  sexualOrientation?: string;
}

@Table({ tableName: 'performers', timestamps: true })
export class PerformerMod extends Model<PerformerMod, PerCreationAttr> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @Column({ type: DataType.BOOLEAN, allowNull: false })
  isPublic: boolean;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  name: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  nickName: string;

  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  email: string;

  @Column({ type: DataType.STRING, unique: false, allowNull: false })
  password: string;

  @Column({ type: DataType.DATE })
  lastLogin: Date;

  @HasMany(() => StreamMod)
  streams: StreamMod[];

  @Column({ type: DataType.STRING })
  avatarUrl: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
    defaultValue: 50,
    validate: { min: 0, max: 100 },
  })
  paymentRate: number;

  @Column({ type: DataType.FLOAT, allowNull: false, defaultValue: 1, validate: { min: 0, max: 100 } })
  c2cAmount: number;

  @BelongsToMany(() => CategoryMod, () => CategoryPerformerModel)
  categories: CategoryMod[];

  @BelongsToMany(() => TagMod, () => TagPerformerModel)
  tags: TagMod[];

  @Column({ type: DataType.STRING })
  about: string;

  @Column({ type: DataType.DATE })
  birthday: Date;

  @Column({ type: DataType.ENUM('male', 'female', 'trans') })
  gender: 'male' | 'female' | 'trans';

  @Column({ type: DataType.STRING })
  bodyType: string;

  @Column({ type: DataType.ARRAY(DataType.STRING) })
  language: string[];

  @Column({ type: DataType.STRING })
  sexualOrientation: string;
}
