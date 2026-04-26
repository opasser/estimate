import { inject, Injectable, InjectionToken } from '@angular/core';
import { HttpService } from '../shared/services/http.abstaract.service';
import { IMessage, TRequestMessages } from '../shared/types';

export const CHAT_API_URL = new InjectionToken<string>('ApiUrl');

@Injectable({
  providedIn: 'root'
})
export class ChatService extends HttpService<IMessage>{
  protected override apiType = inject(CHAT_API_URL);

  sendMessage$(message: IMessage) {
    return this.http.post(`${this.domainName}/chat-message`, message);
  }

  getMessages$(params: TRequestMessages) {
    return this.http.get<IMessage[]>(`${this.domainName}/chat-message`, { params });
  }
}

