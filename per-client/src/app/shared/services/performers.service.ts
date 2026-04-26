import { inject, Injectable, InjectionToken } from '@angular/core';
import { INewImageOrder, IOldImage, IPerformer } from '../types';
import { HttpService } from './http.abstaract.service';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const PER_API_URL = new InjectionToken<string>('ApiUrl');

@Injectable({
  providedIn: 'root'
})
export class PerformersService extends HttpService <IPerformer> {
  protected override apiType = inject(PER_API_URL);

  languageList: string[] = environment.langList;
  genderList: string[] = ['female', 'male', 'trans'];

  uploadImage$(formData: FormData, perfId: number) {
    let headers = new HttpHeaders();
    headers.set('Accept', '*/*');
    return this.http.post<{imageUrl: string}>(
      `${this.domainName}${this.apiType}/${perfId}/save-avatar`, formData, { headers }
    )
  }

  uploadPortfolio$(formData: FormData, perfId: number) {
    let headers = new HttpHeaders();
    headers.set('Accept', '*/*');
    return this.http.post<{imageUrl: string}>(
      `${this.domainName}${this.apiType}/${perfId}/save-portfolio`,
      formData,
      {headers}
    )
  }

  getPortfolio$(perfId: number) {
    return this.http.get<IOldImage[]>(`${this.domainName}${this.apiType}/${perfId}/portfolio`)
  }

  changeImageOrder$(newOrder: INewImageOrder[], perfId: number) {
    return this.http.post(`${this.domainName}${this.apiType}/${perfId}/portfolio/order`, {order: newOrder})
  }

  deleteImage$(perfId: number,imgId: number) {
    return this.http.delete(`${this.domainName}${this.apiType}/${perfId}/portfolio/${imgId}`)
  }
}
