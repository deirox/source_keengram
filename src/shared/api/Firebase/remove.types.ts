export interface IFirebaseRemoveLikeArgs {
  like_uid: string;
  post_uid: string;
}
export type TFirebaseRemoveLike = (
  args: IFirebaseRemoveLikeArgs,
) => Promise<boolean>;
