import { IAPIMethodResponse, IMedia, IPost } from "@/shared/types/api.types";

export interface IFirebaseRemoveLikeArgs {
  like_uid: string;
  post_uid: string;
}
export type TFirebaseRemoveLike = (
  args: IFirebaseRemoveLikeArgs,
) => Promise<boolean>;

export interface IFirebaseRemoveCommentArgs {
  comment_uid: string;
  post_uid: string;
}
export type TFirebaseRemoveComment = (
  args: IFirebaseRemoveCommentArgs,
) => Promise<boolean>;

export interface IFirebaseRemoveMediaArgs {
  media: IMedia[];
}
export type TFirebaseRemoveMedia = (
  args: IFirebaseRemoveMediaArgs,
) => Promise<IAPIMethodResponse<string[]>>;

export interface IFirebaseRemovePostArgs {
  post: IPost;
}
export type TFirebaseRemovePost = (
  args: IFirebaseRemovePostArgs,
) => Promise<IAPIMethodResponse<boolean>>;
