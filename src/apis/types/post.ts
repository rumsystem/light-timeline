import { IProfile } from './profile';
import { TrxStorage } from '../common';
import { IImage } from './common';

export interface IPostTrx {
  Data: {
    type: 'Note'
    content: string
    id?: string
    name?: string
    image?: IImage[]
  };
  Expired: number;
  GroupId: string;
  SenderPubkey: string;
  SenderSign: string;
  TimeStamp: number;
  TrxId: string;
  Version: string;
}

export interface IPostContent {
  content: string
  images?: IImage[]
}

export interface IPost extends IPostContent {
  userAddress: string
  groupId: string
  trxId: string
  latestTrxId: string
  storage: TrxStorage
  timestamp: number
  commentCount: number
  likeCount: number
  hotCount: number
  extra: IPostExtra
}

export interface IPostExtra {
  userProfile: IProfile
  liked?: boolean
}
