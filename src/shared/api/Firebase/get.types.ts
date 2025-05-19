import {
  IAPIMethodResponse,
  IPostComment,
  IPostLike,
  TUserInterfaces,
  TUserTypes,
} from "@/shared/types/api.types";

export interface IFirebaseGetUserArgs {
  by: "uid" | "nickname";
  data: string;
  return_type?: TUserTypes;
}

export type TFirebaseGetUser = (
  args: IFirebaseGetUserArgs,
) => Promise<IAPIMethodResponse<TUserInterfaces>>;

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
