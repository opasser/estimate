import { HttpClient, HttpParams } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { IPages } from '../types';
import { environment } from '../../../environments/environment';

export abstract class HttpService<T> {
  protected http = inject(HttpClient);
  protected apiType = '';
  public domainName = environment.domainName;

  getItemList$(subStr: string = '', page: number, limit: number, listId: string) {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('subStr', subStr.toString())

    if(listId) {
      params = params.set('listId', listId.toString());
    }

    return this.http.get<IPages>(`${this.domainName}${this.apiType}`, { params });
  }

  getItemById$(id: number): Observable<T> {
    return this.http.get<T>(`${this.domainName}${this.apiType}/${id}`);
  }

  submitItem$<T extends {}>(item: T) {
    return this.http.post<any>(`${this.domainName}${this.apiType}/registration`, item);
  }

  editItem$<T extends { id: number }>(item: T) {
    return this.http.put<any>(`${this.domainName}${this.apiType}/${item.id}/edit`, item)
  }

  deleteItem$(id: number): Observable<any> {
    return this.http.delete(`${this.domainName}${this.apiType}/${id}/delete`);
  }
}
