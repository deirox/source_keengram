export interface IFirebaseCreatedAt {
  seconds: number;
  nanoseconds: number;
}
export const initialIFirebaseCreatedAt: IFirebaseCreatedAt = {
  seconds: 0,
  nanoseconds: Date.now(),
};

export interface IAPIMethodResponse<T> {
  status: "success" | "awaiting" | "error";
  data: T | null;
  error?: any | null;
}
export const initialAPIMethodResponse: IAPIMethodResponse<any> = {
  status: "awaiting",
  data: null,
  error: null,
};

export interface IAvatar {
  url: string;
}
export type TUserInterfaces = IAuthor | IAuthorFull | IAuthorizedUser;

export type TUserTypes =
  | "IUser"
  | "IAuthorizedUser"
  | "IAuthor"
  | "IAuthorFull";

export interface IBigDataWithLength<T = null> {
  data: T;
  length: number;
}
export const initialIBigDataWithLength: IBigDataWithLength<[]> = {
  data: [],
  length: 0,
};

export interface IUser {
  type: TUserTypes;
  uid: string;
}

export const initialIUser: IUser = {
  type: "IUser",
  uid: "",
};

export interface IAuthor extends IUser {
  avatar: IAvatar;
  nickname: string;
  name: string;
  surname: string;
  public_key: string;
}

export const initialIAuthor: IAuthor = {
  ...initialIUser,
  type: "IAuthor",
  avatar: {
    url: "",
  },
  nickname: "",
  name: "",
  surname: "",
  public_key: ""
};

export interface IUserMetaInfo {
  subscribed: {
    length: number
  };
  subscribers: {
    length: number
  };
  posts: {
    length: number
  };
  weight: number
}

export interface IEncryptedKeyPBKDF2AESGCM {
  private_key: string,
  iv: string,
  salt: string
}

export const initialIEncryptedKeyPBKDF2AESGCM: IEncryptedKeyPBKDF2AESGCM = {
  private_key: "",
  iv: "",
  salt: ""
};

export const initialIUserMetaInfo: IUserMetaInfo = {
  subscribed: {
    length: 0
  },
  subscribers: {
    length: 0
  },
  posts: {
    length: 0
  },
  weight: 0
};

export interface IAuthorFull extends IAuthor, Omit<IUserMetaInfo, "weight"> {
  created_at?: IFirebaseCreatedAt;
  description: string;
}

export const initialIAuthorFull: IAuthorFull = {
  ...initialIAuthor,
  ...initialIUserMetaInfo,
  type: "IAuthorFull",
  created_at: initialIFirebaseCreatedAt,
  description: "",
  subscribed: initialIBigDataWithLength,
  subscribers: initialIBigDataWithLength,
  posts: initialIBigDataWithLength,
};

export interface IAuthorizedUser extends IAuthorFull, Pick<IUserMetaInfo, 'weight'> {
  accessToken?: string;
  email?: string;
  isAuth?: boolean;
}

export const initialIAuthorizedUser: IAuthorizedUser = {
  ...initialIAuthorFull,
  ...initialIEncryptedKeyPBKDF2AESGCM,
  type: "IAuthorizedUser",
  accessToken: "",
  email: "",
  isAuth: false,
  weight: 0,
};

export interface IPostLike {
  uid: string;
  post_uid: string;
  user_uid: string;
  created_at: IFirebaseCreatedAt;
}

export const initialIPostLike: IPostLike = {
  uid: "",
  post_uid: "",
  user_uid: "",
  created_at: initialIFirebaseCreatedAt,
};

export interface IPostComment {
  uid: string;
  author: string | IAuthor;
  comment_id: number;
  post_uid: string;
  text: string;
  created_at: IFirebaseCreatedAt;
}

export const initialIPostComment: IPostComment = {
  uid: "",
  author: "",
  comment_id: 0,
  post_uid: "",
  text: "",
  created_at: initialIFirebaseCreatedAt,
};

export type TStoragePaths = "images" | "videos" | "users" | "audio" | "music"

export type TMediaTypes = "image" | "video" | "audio" | "gif" | "file"

export interface INewMedia {
  path: string;
  type: TMediaTypes
  file_type: string;
  file: File;
  file_name: string;
}

export interface IMedia {
  uid: string;
  type: TMediaTypes;
  path: string;
  url: string[];
  file_name?: string;
  size?: number;
  duration?: number;
  thumbnail?: string;
  mime_type?: string;
}

export interface IPost {
  uid?: string;
  author: string | IAuthor;
  comments: IBigDataWithLength<IPostComment[]>;
  media: IMedia[];
  likes: IBigDataWithLength<IPostLike[]>;
  post_weight: number;
  created_at: IFirebaseCreatedAt;
}

export const initialIPost: IPost = {
  uid: "",
  author: "",
  comments: initialIBigDataWithLength,
  media: [],
  likes: initialIBigDataWithLength,
  post_weight: 0,
  created_at: initialIFirebaseCreatedAt,
};

export interface IAudio {
  uid: string;
  artist: string;
  author: string | IAuthor;
  image: {
    url: string;
  };
  order: 0;
  path: string;
  title: string;
  url: string;
  public_url: string;
  mime_type: string;
  name: string;
  error?: string;
}

export type TChatTypes = 'private_chat' | "public_group"

export interface IChat {
  uid: string
  type: TChatTypes
  status: string[]
  avatar?: IMedia
  printings: (string | IAuthor)[]
  members: (string | TUserInterfaces)[]
  pined_messages: IBigDataWithLength<IMessage[]>
  messages: IBigDataWithLength<IMessage[]>
  last_message: IMessage
  deleted_for: IBigDataWithLength<string[]>
  created_at: IFirebaseCreatedAt
  updated_at?: IFirebaseCreatedAt
}

export type IMessageType = 'text' | 'image' | 'video' | 'audio' | 'file' | 'location' | 'sticker';

export interface IMessage {
  uid: string;
  type: IMessageType
  id: number;
  author: string | IAuthor;
  status: ('unread' | 'read' | "edited")[]
  reactions: IBigDataWithLength<IMessageReaction[]>;
  reply_to: string
  deleted_for: IBigDataWithLength<string[]>
  created_at: IFirebaseCreatedAt
  updated_at?: IFirebaseCreatedAt
  content: string | ITextMessageContent | IMediaMessageContent | ILocationMessageContent | IStickerMessageContent
  isRead: boolean
  iv: string
}

export interface ITextMessageContent {
  text?: string;
}

export interface IMediaMessageContent {
  media?: IMedia;
  caption?: string
}

export interface ILocationMessageContent {
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };
}

export interface IStickerMessageContent {
  sticker?: {
    id: string;
    url: string;
    pack?: string;
  };
}


export interface IMessageReaction {
  // package: string

  // uids, that stored in subcollection
  authors: IBigDataWithLength<string[]>
  emoji: string
  count: number
}