import { Inject, Injectable, InjectionToken } from '@angular/core';
import { HttpService } from './http.abstaract.service';
import { ICategory } from '../types';
import { HttpHeaders } from '@angular/common/http';

export const CAT_API_URL = new InjectionToken<string>('ApiUrl');

@Injectable({
  providedIn: 'root'
})
export class CategoryTagService extends HttpService<ICategory> {
  featureName = 'categories';

  constructor(@Inject(CAT_API_URL) apiUrl: string) {
    super();
    this.apiType = apiUrl;
  }

  getNameList$() {
    return this.http.get<string[]>(`${this.domainName}/${this.featureName}/names-list`);
  }

  getList$() {
    return this.http.get<ICategory[]>(`${this.domainName}/${this.featureName}`);
  }

  uploadImage$(formData: FormData, id: number) {
    let headers = new HttpHeaders();
    headers.set('Accept', '*/*');

    return this.http.post<{imageUrl: string}>(
      `${this.domainName}${this.apiType}/${id}/save-image`, formData, {headers}
    );
  }
}
