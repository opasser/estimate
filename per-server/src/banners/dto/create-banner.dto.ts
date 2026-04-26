export class BannerDto {
  scope: 'all' | 'preview' | 'member';
  section: 'index-top' | 'index-mid' | 'index-bottom' | 'custom';
  url?: string;
  alt?: string;
  imgPath?: string;
  imgH?: number;
  imgW?: number;
  locale: string;
}
