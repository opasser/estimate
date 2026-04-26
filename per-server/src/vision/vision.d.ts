namespace Vision {
  export interface IAuthBody {
    nickname: string;
    uniqueUserId: string;
    tokenValidForMinutes: number;
  }

  export interface IRoom {
    performerName: string;
    assetFilePath: string;
    isRoomOnline?: boolean;
    profileThumbnail?: string;
  }

  export interface IPerformer {
    performerName: string;
    assetType: string;
    assetFile: string;
    assetFilePath: string;
  }

  export interface IPerformerProfile {
    langCode: string;
    modelName: string;
  }
}
