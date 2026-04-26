import { IBanner } from '../../shared/types';
import { inject, Injectable, InjectionToken } from '@angular/core';
import { HttpService } from '../../shared/services/http.abstaract.service';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const BAN_API_URL = new InjectionToken<string>('ApiUrl');

@Injectable()
export class BannerTableService extends HttpService<IBanner>{
  protected override apiType = inject(BAN_API_URL);
  localeList = environment.langList;
  scopeArr = ['all', 'preview', 'member'];
  sectionArr = ['index-top', 'index-mid', 'index-bottom','custom'];

  uploadImage$(formData: FormData, id: number) {
    let headers = new HttpHeaders();
    headers.set('Accept', '*/*');

    return this.http.post<{imageUrl: string}>(
        `${this.domainName}${this.apiType}/${id}/save-image`, formData, {headers}
    );
  }
}
