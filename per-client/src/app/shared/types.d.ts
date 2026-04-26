import { FormControl } from '@angular/forms';
import { ITableItemAction } from './entity-table/entity-table.abstract.component';

export interface IAdmin {
  id: number;
  name: string;
  email: string;
  password: string;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IPerformer {
  id: number;
  name: string;
  nickName: string;
  email: string;
  password: string;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
  avatarUrl: string;
  isPublic: boolean;
  paymentRate: number;
  c2cAmount: string | mumber;
  category: string[];
  tag: string[];
  about: string;
  birthday: string;
  gender: string;
  bodyType: string;
  language: string[];
  sexualOrientation: string;
}

export interface ICommonEntity {
  id: number;
}

export interface IPages {
  entities: ICommonEntity[];
  meta: {
    itemCount: number;
    currentPage: number;
    totalPages: number;
  }
}

export interface IStream {
  id: number;
  performerId: number;
  streamId: string;
  status: string;
  startTime: string;
  endTime: string;
}

export interface IMember {
  providerId: number,
  email: string,
  userName: string;
  status: 'free' | 'premium';
  lastToken: string;
}

export interface IStreamToken {
  streamId: string;
  token: string;
}

export interface IPayment  {
  id: number;
  type: 'tips' | 'c2c' | 'stream';
  performerId: number;
  memberId: number;
  streamId: number;
  amount: number;
  performerRate: number;
  date: Date;
}

export type TRole = 'admin' | 'member' | 'performer' | 'tips-action';

export interface IMessage {
  message: string;
  streamId: string;
  participantId: number;
  nickName: string;
  role: TRole;
  privacy: 'private' | 'public';
  privateTo: string;
  amount?: number;
}

export interface IDataPayload {
  type: DataType;
  message: IMessage;
}

export interface IEmitMessage {
  message: string;
  type: DataType;
  privateTo?: string;
  isSystem?: boolean;
  amount?: number;
}

export type DataType = 'message' | 'tips' | 'c2c';

export interface IJwtPayload {
  exp: number;
  role: TRole[];
  id: number;
  nickName: string;
}

export interface ILogin {
  email: string;
  password: string;
}

type IToken = Pick<{token: string}, "token">

export interface IRoom {
  name: string;
  nickName: string;
  id: number;
  avatarUrl: string;
  status: TPerformerStatus;
  privacy: TPrivacy;
  streamId: string;
  privateWith: number | null;
  roomId: string | null;
}

export type TPerformerStatus = "active" | "finished";

export interface IStreamData {
  streamId: string;
  status: string;
}

export interface INewAdminDate {
  id: number;
  name: string;
  email: string;
  password?: string;
}

interface IAdminForm {
  name: FormControl<string | null>;
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

export interface IPerformerProfileForm {
  name: FormControl<string | null>;
  nickName: FormControl<string | null>;
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  c2cAmount: FormControl<string | null>;
  category: FormControl<string[] | null>;
  tag: FormControl<string[] | null>;
  about: FormControl<string | null>;
  birthday: FormControl<string | null>;
  gender: FormControl<string | null>;
  bodyType: FormControl<string | null>;
  language: FormControl<string[] | null>;
  sexualOrientation: FormControl<string | null>;
}

export interface IPerformerForm {
  name: FormControl<string | null>;
  nickName: FormControl<string | null>;
  email: FormControl<string | null>;
  password: FormControl<string | null>;
  isPublic: FormControl<boolean | null>;
  paymentRate: FormControl<number | null>;
  c2cAmount: FormControl<string | null>;
  category: FormControl<string[] | null>;
  tag: FormControl<string[] | null>;
  about: FormControl<string | null>;
  birthday: FormControl<string | null>;
  gender: FormControl<string | null>;
  bodyType: FormControl<string | null>;
  language: FormControl<string[] | null>;
  sexualOrientation: FormControl<string | null>;
}

interface ICategoryForm {
  name: FormControl<string | null>;
  title: FormControl<string | null>;
  description: FormControl<string | null>;
  seoTitle: FormControl<string | null>;
  seoDescription: FormControl<string | null>;
  seoKeywords: FormControl<string | null>;
  seoH1: FormControl<string | null>;
}

interface ITagForm extends ICategoryForm {}

export interface INewPerformerDate {
  id: number;
  name: string;
  email: string;
  nickName: string;
  password?: string;
  isPublic: boolean;
  paymentRate: number;
  c2cAmount: string;
  category: string[];
  about: string;
  birthday: string;
  gender: string;
  bodyType: string;
  language: string[];
  sexualOrientation: string;
}

export interface IProcessingData {
  performerId: number;
  performerName?: string;
  amount: number;
}

export interface IPerformerPayouts {
  amount: string,
  createdAt: string,
  performerName: string,
}

export interface IPerformerPayments {
  id: number;
  type: string;
  streamId: string;
  payoutId: string | null;
  data: string;
  amount: number;
  memberName: string;
}

interface ILoginForm {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

export interface ITableItemActionEmit {actionName: string, value: string | number}

export interface ITableItemAction {
  actionName:  string;
  propertyName: string;
  iconNane: string;
  tooltip: string;
}

export interface IInputDeviceInfo {
  deviceId: string;
  kind: string;
  label: string;
  groupId: string;
}

export interface IEvent {
  eventName: TEventName;
  memberNickName?: string;
  memberId?: number;
  role?: TRole;
  status?: "request" | "reject" | "accept";
  streamId?: string;
}

export interface IPrivateStream extends IEvent {
  roomId: string;
  privateStreamId: string;
  performerId: number;
}

export type TEventName = 'camToCam' | 'stillConnected' | 'liveRoom';

export type TDeviceType = 'video' | 'audio';

export interface IPayData {
  performerId: number;
  amount: number;
  comment: string;
}

export interface IUserData {
  userId: string;
  height: string;
  width: string;
}

export interface ILoginData {
  token: string;
  userData: IUserData;
  path?: string;
  lang: string;
}

export interface INewImage {
  file: File;
  path: string;
  order: number;
}

export interface IOldImage {
  id: number;
  performerId: number;
  thumbnailPath: string;
  order: number;
  thumbH: number;
  thumbW: number;
  imagePath: string;
}

export interface INewImageOrder {
  order: number;
  id: number;
  performerId: number;
}

export interface ITips {
  type: string;
  streamId: string;
  performerId: number;
  amount: number;
  memberId: number;
}

export type TPaymentsType = 'tips' | 'c2c'

export type TRequestMessages = Pick<IMessage,  'streamId' | 'participantId' | 'role'| 'nickName'>;

export interface IConfirmDialogData {
  title: string;
  text: string;
  cancelButton?: string;
  confirmButton?: string;
}

export interface IRegisterStream {
  streamId: string;
  performerId: number;
  privacy: TPrivacy;
  privateWith?: number;
}

export type TPrivacy = 'public' | 'private';

export interface IPrivateRoomPayload {
  streamId: string;
  role: string;
  participantId: number;
}

export interface IPrivateRoomData {
  performerId: number;
  streamId: string;
  status: TPerformerStatus;
  privacy: TPrivacy;
  privateWith: number;
  participant?: IPrivateRoomParticipant
  member: { name: string };
  performer: { name: string };
}

export interface IPrivateRoomParticipant {
  role: TRole;
  id: number;
  nickName: string;
}

export interface ITag {
  id: number;
  name: string;
  url: string;
  title: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoH1: string;
}

export interface ICategory extends ITag {
  thumbnail: string;
}

export type TSection = 'index-top' | 'index-mid' | 'index-bottom' | 'custom'

export interface IBanner {
  id: number;
  scope: 'all' | 'preview' | 'member';
  section: TSection;
  url: string;
  imgH: string;
  imgW: string;
  imgPath: string;
  alt: string;
  locale: string;
}


export interface IBannerForm {
  scope: FormControl<'all' | 'preview' | 'member' | null>;
  section: FormControl<'index-top' | 'index-mid' | 'index-bottom' | 'custom' | null>;
  url: FormControl<string | null>;
  alt: FormControl<string | null>;
  locale: FormControl<string | null>
}
