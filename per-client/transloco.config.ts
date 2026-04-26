import { environment } from './src/environments/environment';
import { TranslocoGlobalConfig } from '@jsverse/transloco-utils';

const config: TranslocoGlobalConfig = {
  rootTranslationsPath: 'public/i18n/',
  langs: environment.langList,
  keysManager: {}
};

export default config;
