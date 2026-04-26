import { Inject, Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import {
  catchError,
  combineLatest,
  firstValueFrom,
  from,
  iif,
  map,
  mergeMap,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { fromFetch } from 'rxjs/internal/observable/dom/fetch';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import IPerformerProfile = Vision.IPerformerProfile;

export interface IPerformerAsset {
  assetType: string;
  assetFilePath: string;
  assetFile: string;
}

export interface ISortedContent {
  [key: string]: IPerformerAsset[];
}

export interface ISortedProfile {
  [key: string]: IPerformerProfile;
}

@Injectable()
export class VisionService {
  private readonly DOMAIN_NAME = this.configService.get<string>('VISION_DOMAIN_NAME');
  private readonly HEADERS = {
    ApiKey: `${this.configService.get<string>('VISION_API_KEY')}`,
  };

  private readonly ASSET_TYPE_PROFILE_IMAGE = "ProfileImage";
  private readonly ASSET_TYPE_PROFILE_THUMBNAIL = 'ProfileThumbnail';
  private readonly PERFORMERS_KEY = 'performers';
  private readonly SORTED_PERFORMERS_KEY = 'sortedPerformer';
  private readonly SORTED_PERFORMERS_PROFILE_KEY = 'sortedPerformerProfile'

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) {}

  async login(authData: Vision.IAuthBody) {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post(`${this.DOMAIN_NAME}/api/auth/authenticate-end-user`,
          authData, { headers: this.HEADERS })
      );

      return data
    } catch (error) {
      console.error(`login => vision login error:`, error)

      return { jwtToken: '' }
    }
  }

  async getRoomsForShowcase(): Promise<Vision.IRoom[]> {
    const [performers, rooms] = await firstValueFrom(
        combineLatest([this.getPerformers$(), this.getRooms$()])
    );

    const roomsOnline = await this.getRoomsOnline(rooms);
    const roomsOffline = this.getOfflinePerformers(
        performers,
        roomsOnline.map(room => room.performerName)
    );

    return [...roomsOnline, ...roomsOffline];
  }

  async getSortedPerformerContent(): Promise<ISortedContent> {
    const sortedContent = await this.cacheManager.get<ISortedContent>(this.SORTED_PERFORMERS_KEY);
    if (sortedContent) return sortedContent;

    await firstValueFrom(this.getPerformers$());
    return await this.cacheManager.get<ISortedContent>(this.SORTED_PERFORMERS_KEY);
  }

  async getPerformerContentByName(name: string) {
    const roomsOnline = await firstValueFrom(this.getRooms$());
    const room = roomsOnline.find(room => room.performerName === name);
    const sortedContent = await this.getSortedPerformerContent();
    const content = sortedContent[name] ?? [];
    const profileThumbnail = content.find(item => item.assetType === this.ASSET_TYPE_PROFILE_THUMBNAIL)?.assetFilePath || '';
    const profiles = await this.cacheManager.get<IPerformerProfile>(this.SORTED_PERFORMERS_PROFILE_KEY);
    const profile = profiles?.[name] ?? {};

    return {
      profile,
      content,
      room: room?.isRoomOnline
          ? { ...room, profileThumbnail }
          : { performerName: name, isRoomOnline: false, profileThumbnail }
    };
  }

  private getRooms$(): Observable<Vision.IRoom[]> {
    return fromFetch(`${this.DOMAIN_NAME}/api/auth/securecasting-rooms`, { headers: this.HEADERS }).pipe(
        switchMap(res => res.json()),
        catchError(error => {
          console.error('getRooms$ => Fetch error:', error);
          return of([]);
        })
    );
  }

  private getPerformers$(): Observable<Vision.IPerformer[]> {
    return from(this.cacheManager.get<Vision.IPerformer[]>(this.PERFORMERS_KEY)).pipe(
        mergeMap(cachedPerformers =>
            iif(() => Boolean(cachedPerformers), of(cachedPerformers), this.fetchAndCachePerformersData())
        )
    );
  }

  private sortProfileByPerformersName(profile: Vision.IPerformerProfile[]): ISortedProfile {
    return profile.reduce<ISortedProfile>((acc, cur) => {
      if(!acc[cur.modelName] && cur.langCode === 'EN') {
        acc[cur.modelName] = cur

      }

      return acc;
    }, {});
  }

  private fetchAndCachePerformersData(): Observable<Vision.IPerformer[]> {
    return combineLatest([
      fromFetch(`${this.DOMAIN_NAME}/api/performer/performer-asset-list`, { headers: this.HEADERS })
        .pipe(switchMap(response => response.json())),
      fromFetch(`${this.DOMAIN_NAME}/api/performer/performer-profiles`, { headers: this.HEADERS })
        .pipe(switchMap(response => response.json()))
    ]).pipe(
      mergeMap(([performers, profiles]: [Vision.IPerformer[], Vision.IPerformerProfile[]]) =>
        from(Promise.all([
          this.cacheManager.set(this.PERFORMERS_KEY, performers),
          this.cacheManager.set(this.SORTED_PERFORMERS_KEY, this.sortContentByPerformersName(performers)),
          this.cacheManager.set(this.SORTED_PERFORMERS_PROFILE_KEY, this.sortProfileByPerformersName(profiles))
        ])).pipe(map(() => performers))
      ),
      catchError(error => {
        console.error('fetchAndCachePerformers => Fetch error:', error);
        return of([]);
      })
    );
  }


  private getOfflinePerformers(performers: Vision.IPerformer[], onlineRooms: string[]): Vision.IRoom[] {
    return performers.reduce<Vision.IRoom[]>((acc, performer) => {
      if (!onlineRooms.includes(performer.performerName) && performer.assetType === this.ASSET_TYPE_PROFILE_IMAGE) {
        acc.push({ performerName: performer.performerName, assetFilePath: performer.assetFilePath });
      }
      return acc;
    }, []);
  }

  private sortContentByPerformersName(performers: Vision.IPerformer[]): ISortedContent {
    return performers.reduce<ISortedContent>((acc, { performerName, assetType, assetFilePath, assetFile }) => {
      if (!acc[performerName]) acc[performerName] = [];
      acc[performerName].push({ assetType, assetFilePath, assetFile });
      return acc;
    }, {});
  }

  private async getRoomsOnline(rooms: Vision.IRoom[]): Promise<Vision.IRoom[]> {
    const sortedContent = await this.getSortedPerformerContent();

    return await Promise.all(
      rooms
        .filter(room => room.isRoomOnline && Boolean(room.performerName))
        .map(async (room) => {
          const content = sortedContent[room.performerName];
          const profileItem = content?.find(item => item.assetType === this.ASSET_TYPE_PROFILE_IMAGE);
          return profileItem ? { ...room, assetFilePath: profileItem.assetFilePath } : room;
        })
    );
  }
}
