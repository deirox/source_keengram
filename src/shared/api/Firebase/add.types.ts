import {
  IPost,
  IPostComment,
  IPostLike,
  IMedia,
  INewMedia,
  IAPIMethodResponse,
} from "@/shared/types/api.types";

export interface IFirebaseAddPostArgs {
  post: Omit<IPost, "uid">;
}
export type TFirebaseAddPost = (args: IFirebaseAddPostArgs) => Promise<IAPIMethodResponse<IPost>>;

export interface IFirebaseAddLikeArgs {
  post_uid: string;
  user_uid: string;
}
export type TFirebaseAddLike = (
  args: IFirebaseAddLikeArgs,
) => Promise<IPostLike>;

export interface IFirebaseAddCommentsArgs {
  comment: Omit<IPostComment, "uid" | "created_at">;
}
export type TFirebaseAddComments = (
  args: IFirebaseAddCommentsArgs,
) => Promise<IPostComment>;

export type IFirebaseAddMediaArgs = INewMedia[];

export type TFirebaseAddMedia = (
  args: IFirebaseAddMediaArgs,
) => Promise<IAPIMethodResponse<IMedia[]>>;
