import { IProfile } from './profile';
import { TrxStorage } from '../common';
import { IImage } from './common';

export interface ICommentTrx {
  Data: {
    type: 'Note'
    content: string
    id?: string
    name?: string
    image?: IImage[]
    inreplyto?: {
      trxid: string
    }
  };
  Expired: number;
  GroupId: string;
  SenderPubkey: string;
  SenderSign: string;
  TimeStamp: number;
  TrxId: string;
  Version: string;
}

export interface ICommentContent {
  content: string
  objectId: string
  threadId?: string
  replyId?: string
  images?: IImage[]
}

export interface IComment extends ICommentContent {
  userAddress: string
  groupId: string
  trxId: string
  storage: TrxStorage
  timestamp: number
  commentCount: number
  likeCount: number
  hotCount: number
  extra: ICommentExtra
}

export interface ICommentExtra {
  userProfile: IProfile
  liked?: boolean
  replyComment?: IComment
  comments?: IComment[]
}