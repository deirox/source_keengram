import {
  IAPIMethodResponse,
  IPostComment,
  IPostLike,
  TUserInterfaces,
  TUserTypes,
} from "@/shared/types/api.types";

export interface IFirebaseGetUsersArgs {
  count: number
  settings?: {
    include_authorized?: boolean
  }
  return_type?: TUserTypes
}

export type TFirebaseGetUsers = (
  args: IFirebaseGetUsersArgs,
) => Promise<IAPIMethodResponse<TUserInterfaces[]>>;

export interface IFirebaseGetUserArgs {
  by: "uid" | "nickname";
  data: string;
  return_type?: TUserTypes;
}

export type TFirebaseGetUser = <UserType>(
  args: IFirebaseGetUserArgs,
) => Promise<IAPIMethodResponse<UserType>>;


export interface IFirebaseGetUserMetaInfoArgs<T = TUserInterfaces> {
  return_type: TUserTypes;
  user: T | null
}
export type TFirebaseGetUserMetaInfo = <T>(
  args: IFirebaseGetUserMetaInfoArgs<T>,
) => Promise<T | null>;

export interface IFirebaseGetCommentsArgs {
  post_uid: string;
  page?: number;
  limit_count?: number;
}

export type TFirebaseGetComments = (
  args: IFirebaseGetCommentsArgs,
) => Promise<IAPIMethodResponse<IPostComment[]>>;

export interface IFirebaseGetLikeArgs {
  post_uid: string;
  user_uid: string;
  page?: number;
  limit_count?: number;
}

export type TFirebaseGetLike = (
  args: IFirebaseGetLikeArgs,
) => Promise<IAPIMethodResponse<IPostLike>>;
