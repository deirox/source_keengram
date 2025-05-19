import {
  IPost,
  IPostComment,
  IPostLike,
  IPostMedia,
} from "@/shared/types/api.types";

export interface IFirebaseAddPostArgs {
  post: Omit<IPost, "uid" | "created_at">;
}
export type TFirebaseAddPost = (args: IFirebaseAddPostArgs) => Promise<IPost>;

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

export type IFirebaseAddMediaArgs = {
  path: string;
  file: File;
  file_name: string;
}[];

export type TFirebaseAddMedia = (
  args: IFirebaseAddMediaArgs,
) => Promise<IPostMedia[]>;
