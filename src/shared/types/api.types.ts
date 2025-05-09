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

export interface IBigDataWithLength<T> {
  data: T;
  length: number;
}

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
    url: "/keengram/img/EmptyAvatar.jpg",
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
  subscribed: {
    data: [],
    length: 0,
  },
  subscribers: {
    data: [],
    length: 0,
  },
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

export interface IPostComment {
  uid: string;
  author: string | IAuthor;
  comment_id: number;
  post_uid: string;
  text: string;
  timestamp: number;
}

export const initialIPostComment: IPostComment = {
  uid: "",
  author: "",
  comment_id: 0,
  post_uid: "",
  text: "",
  timestamp: 0,
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
  likes: IBigDataWithLength<string[]>;
  post_weight: number;
  created_at: IFirebaseCreatedAt;
}

export const initialIPost: IPost = {
  uid: "",
  author: "",
  comments: {
    data: [],
    length: 0,
  },
  media: [],
  likes: {
    data: [],
    length: 0,
  },
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
