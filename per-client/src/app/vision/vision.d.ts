namespace Vision {
  export interface IPerformerContent {
    performerName: string,
    assetType: string,
    assetFile: string,
    assetFilePath: string
  }

  export interface IRoom {
    roomId: number,
    roomName: string,
    performerName: string,
    isRoomOnline: boolean,
    connectedUsersCount: number,
    assetFilePath?: string,
    profileThumbnail?: string,
  }

  export interface IAuthenticate {
    jwtToken: string
    uniqueUserId: string,
    nickname: string,
    tokenValidForMinutes: string,
    redirectOnExpiration: null | string
  }

  export interface IAuthBody {
    nickname: string,
    uniqueUserId: string,
    tokenValidForMinutes: number
  }

  export interface IStreamData {
    videoStreamUrl: string | SafeResourceUrl,
    videoStreamToken: string
  }

  export interface IRoomData {
    content: IPerformer[]
    room: IRoom,
    profile: IPerformerProfile
  }

  export interface IPerformerProfile {
    [key:string]: string,
    active?: string;
    languageSkillCodes?: string;
    langCode?: string;
    modelName?: string;
    favoriteDrink?: string;
    favoriteFlower?: string;
    measureBust?: string;
    measureHips?: string;
    measureWaist?: string;
  }
}
