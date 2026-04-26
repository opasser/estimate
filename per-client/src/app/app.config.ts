import {
  ApplicationConfig,
  DEFAULT_CURRENCY_CODE,
  provideZoneChangeDetection,
  isDevMode,
  provideBrowserGlobalErrorListeners
   } from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  // withComponentInputBinding,
  // withDebugTracing,
  // withRouterConfig,
  withHashLocation,
  withPreloading,
} from '@angular/router';
import { APP_ROUTES } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from './shared/token.interceptor';
import { httpStatusInterceptor } from './shared/http-status.interceptor';
import { PER_API_URL } from './shared/services/performers.service';
import { STR_API_URL } from './admin/service/stream-table.service';
import { ADM_API_URL } from './admin/service/admin-table.service';
import { MEM_API_URL } from './admin/service/members-table.service';
import { CHAT_API_URL } from './chat/chat.service';
import { CAT_API_URL } from './shared/services/category-tag.service';
import { BAN_API_URL } from './admin/service/banner-table.service';
import { TAG_API_URL } from './admin/tags-table/tags-table.component';
import { TranslocoHttpLoader } from './transloco-loader';
import { provideTransloco,  } from '@jsverse/transloco';
import { provideTranslocoPersistLang, cookiesStorage } from '@jsverse/transloco-persist-lang';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      APP_ROUTES,
      withHashLocation(),
      withPreloading(PreloadAllModules),
      // withComponentInputBinding(),
      // withRouterConfig({paramsInheritanceStrategy: 'always'}),
      // withDebugTracing(),
    ),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        tokenInterceptor,
        httpStatusInterceptor
      ])
    ),
    { provide: ADM_API_URL, useValue: '/admin/admins' },
    { provide: PER_API_URL, useValue: '/admin/performers' },
    { provide: MEM_API_URL, useValue: '/admin/members' },
    { provide: STR_API_URL, useValue: '/admin/active-streams' },
    { provide: CAT_API_URL, useValue: '/admin/categories' },
    { provide: TAG_API_URL, useValue: '/admin/tags' },
    { provide: BAN_API_URL, useValue: '/admin/banners' },
    { provide: CHAT_API_URL, useValue: '/admin/message-list' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'USD' },
    provideHttpClient(),
    provideTransloco({
        config: {
          availableLangs: environment.langList,
          defaultLang: 'en',
          fallbackLang: 'en',
          // Remove this option if your application doesn't support changing language in runtime.
          reRenderOnLangChange: true,
          prodMode: !isDevMode(),
        },
        loader: TranslocoHttpLoader
      }),
    provideTranslocoPersistLang({
      storage: {
        useValue: cookiesStorage(),
      },
    }),
  ],
};
