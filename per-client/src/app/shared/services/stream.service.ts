import { inject, Injectable } from '@angular/core';
import { HttpService } from './http.abstaract.service';
import { PER_API_URL } from './performers.service';
import {
  IRoom, IPrivateRoomData,
  IPrivateRoomPayload,
  IRegisterStream,
  IStreamData,
} from '../types';
import { HttpParams } from '@angular/common/http';


@Injectable({
  providedIn: 'root'
})
export class StreamService extends HttpService <Partial<IStreamData>> {
  protected override apiType = inject(PER_API_URL);

  registerStream$(registerStream: IRegisterStream) {
    return this.http.post<{ streamData: IRegisterStream }>(`${this.domainName}/performer/register-stream`, registerStream)
  }

  finishStream$(performerId: number, streamId: string) {
    const payload = {
      performerId,
      streamId
    }
    return this.http.post(`${this.domainName}/performer/finish-stream`, payload)
  }

  getRooms$() {
    return this.http.get<IRoom[]>(`${this.domainName}/performers/rooms`);
  }

  getRoomsByCategory$(category: string) {
    return this.http.get<IRoom[]>(`${this.domainName}/rooms/${category}`);
  }

  getPerformerRoomData$(nickName: string) {
    return this.http.get<IRoom>(`${this.domainName}/performers/${nickName}`)
  }

  getPrivateRoomData$(payload: IPrivateRoomPayload ) {
    const params = new HttpParams({ fromObject: payload as unknown as Record<string, string> });

    return this.http.get<IPrivateRoomData>(`${this.domainName}/private-stream`, { params })
  }

  updateMembersCounter$(viewers: number, streamId: string) {
    const payload = { viewers, streamId };

    return this.http.post(`${this.domainName}/stream/viewers-counter`, payload);
  }
}
