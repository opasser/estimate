import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom, tap } from 'rxjs';
import { visionEnvironment } from './environment.vision';
import { VAuthService } from './v-auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VisionService {
  ASSET_TYPE = "ProfileImage";
  http = inject(HttpClient);
  authService =inject(VAuthService);
  vDomainName= visionEnvironment.domainName;
  domainName= environment.domainName;
  timeout!: ReturnType<typeof setTimeout>;

  getVideoChatUrl(roomId: number){
    const token = this.authService.getToken(this.authService.VISION_TOKEN_KEY) || '';
    const headers = new HttpHeaders({ 'Authorization': token });
    const body =  { roomId: roomId };

    return this.http.post<Vision.IStreamData>(
      `${this.vDomainName}/api/video-stream/video-stream-url`, body, { headers }
    );
  }

  getContentByPerformerName$(name: string) {
    return this.http.get<Vision.IRoomData>(
      `${this.domainName}/vision/performer/${name}`
    )
  }

  authenticate$(authBody: Vision.IAuthBody) {
    return this.http.post<Vision.IAuthenticate>(`${this.domainName}/vision/login`, authBody)
      .pipe(tap(res => {
        if(res.jwtToken) {
          this.authService.setToken(res.jwtToken, this.authService.VISION_TOKEN_KEY);

          clearTimeout(this.timeout);
          this.timeout = setTimeout(async (body:any) => {
            await firstValueFrom(this.authenticate$(body));
          }, this.toMilSec(visionEnvironment.tokenLife), authBody);
        }
      }))
  }

  getRooms$() {
    return this.http.get<Vision.IRoom[]>(`${this.domainName}/vision/rooms`)
  }

  toMilSec(minutes: number): number {
    const milSec = minutes * 60 * 1000;
    return milSec - milSec * 0.1;
  }
}

