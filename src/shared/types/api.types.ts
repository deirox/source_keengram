export interface IFirebaseCreatedAt {
  seconds: number;
  nanoseconds: number;
}
export const initialIFirebaseCreatedAt: IFirebaseCreatedAt = {
  seconds: 0,
  nanoseconds: 0,
};

export interface IAPIMethodResponse<T = unknown> {
  status: "success" | "awaiting" | "error";
  data: T | null;
  error?: null | unknown;
}

export const initialAPIMethodResponse: IAPIMethodResponse = {
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
}

export const initialIAuthor: IAuthor = {
  ...initialIUser,
  type: "IAuthor",
  avatar: {
    url: "keengram/img/EmptyAvatar.jpg",
  },
  nickname: "",
  name: "",
  surname: "",
};

export interface IAuthorFull extends IAuthor {
  created_at: IFirebaseCreatedAt;
  description: string;
  subscribed: IBigDataWithLength<string[]>;
  subscribers: IBigDataWithLength<string[]>;
}

export const initialIAuthorFull: IAuthorFull = {
  ...initialIAuthor,
  type: "IAuthorFull",
  created_at: initialIFirebaseCreatedAt,
  description: "",
  subscribed: initialIBigDataWithLength,
  subscribers: initialIBigDataWithLength,
};

export interface IAuthorizedUser extends IAuthorFull {
  accessToken?: string;
  email?: string;
  isAuth?: boolean;
}

export const initialIAuthorizedUser: IAuthorizedUser = {
  ...initialIAuthorFull,
  type: "IAuthorizedUser",
  accessToken: "",
  email: "",
  isAuth: false,
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
export interface IPostMedia {
  uid: string;
  type: "image" | "video";
  url: string;
}

export interface IPost {
  uid?: string;
  author: string | IAuthor;
  comments: IBigDataWithLength<IPostComment[]>;
  media: IPostMedia[];
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
