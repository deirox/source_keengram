import { BaseSyntheticEvent, FC, lazy, Suspense, useRef, useState } from "react";
import { BsSuitHeart, BsSuitHeartFill } from "react-icons/bs";
import { FaRegComment } from "react-icons/fa";
import { useUserStore } from "@/shared/store/useUserStore";
import { usePostsStore } from "@/shared/store/usePostsStore";
import MiniComment from "@/components/MiniComment";
import styles from "./Post.module.css";
import cn from "classnames";
import ReactImageGallery, { ReactImageGalleryItem } from "react-image-gallery";
const PostCardModal = lazy(() => import("./PostModal"));
import { IPost } from "@/shared/types/api.types";
import FCPostHeader from "@/entities/PostTopBar";


const PostCard: FC<{ post: IPost }> = ({ post }) => {
  const {
    uid = "",
    media = [],
    likes = { data: [], length: 0 },
    comments = { data: [], length: 0 },
  } = post;
  const authorizedUserData = useUserStore((state) => state.authorizedUserData);
  if (!authorizedUserData) {
    return <>Loading...</>
  }
  const [isPostCardModalOpen, setIsPostCardModalOpen] = useState(false);

  const [comment, setComment] = useState("");

  const formatedImages = useRef(media.map((m) => {
    return { ...m, original: m.url[m.url.length - 1], thumbnail: m.url[m.url.length - 1] } as ReactImageGalleryItem;
  }));

  const isMutatePostsLoading = usePostsStore(
    (state) => state.isMutatePostsLoading,
  );
  const mutateLike = usePostsStore((state) => state.mutateLike);
  const onLike = () => {
    // console.log("likes", likes);
    mutateLike({
      like_uid: likes.data.length > 0 ? likes.data[0].uid : "",
      postUid: uid,
      userUid: authorizedUserData.uid,
      action: likes.data.length > 0 ? "remove" : "add",
    });
  };

  const addComment = usePostsStore((state) => state.addComment);
  const onAddComment = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    if (comment.length > 0) {
      addComment({ post_uid: uid, author: authorizedUserData, comment_id: post.comments.length, text: comment });
      setComment("");
    }
  };

  return (
    <article className={styles.post_card}>
      <Suspense fallback={<></>}>
        <PostCardModal
          post={post}
          isOpen={isPostCardModalOpen}
          onClose={() => setIsPostCardModalOpen(false)}
        />
      </Suspense>
      <FCPostHeader authorizedUserData={authorizedUserData} post={post} />
      <div className={styles.post_card__picture}>
        <ReactImageGallery
          items={formatedImages.current}
          showBullets={formatedImages.current.length > 1}
          showThumbnails={false}
          showPlayButton={false}
          infinite={false}
          showFullscreenButton={false}
        />
      </div>
      <div className={styles.post_card__bottom}>
        <div className={styles.post_card__buttons}>
          <button
            className={cn(
              styles.post_card__button,
              authorizedUserData !== null &&
                likes.data.filter(
                  (like) => like.user_uid === authorizedUserData.uid,
                ).length > 0
                ? styles.post_card__button_like
                : "",
            )}
            onClick={onLike}
          >
            {authorizedUserData !== null &&
              likes.data.filter(
                (like) => like.user_uid === authorizedUserData.uid,
              ).length > 0 ? (
              <BsSuitHeartFill color="rgb(255, 48, 64)" />
            ) : (
              <BsSuitHeart color="#fff" />
            )}
          </button>
          <button className={styles.post_card__button}>
            <FaRegComment color="#fff" onClick={() => setIsPostCardModalOpen(true)} />
          </button>
        </div>

        <p className={styles.post_card__like_string}>
          {likes.length > 0
            ? likes.length > 1
              ? `${likes.length} отметок "Нравиться"`
              : `${likes.length} отметка "Нравиться"`
            : `Поставьте первую отметку "Нравиться"!`}
        </p>
        {comments.data.length > 0 && (
          <MiniComment
            nickname={
              typeof comments.data[0]?.author === "object"
                ? comments.data[0]?.author.nickname
                : ""
            }
            text={comments.data[0]?.text}
          />
        )}
        {comments.length > 1 && (
          <button
            className={styles.post_card__show_comment_btn}
            onClick={() => setIsPostCardModalOpen(true)}
          >
            Показать все комментарии ({comments.length})
          </button>
        )}
        <form
          className={styles.post_card__form}
          onSubmit={(e) => {
            onAddComment(e);
          }}
          aria-disabled={isMutatePostsLoading}
        >
          <textarea
            className={styles.post_card__form__textarea}
            // type="text"
            placeholder="Добавьте комментарий..."
            maxLength={200}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          // resize="none"
          />
          {comment.length > 0 && (
            <button className={styles.post_card__form__button}>
              Опубликовать
            </button>
          )}
        </form>
      </div>
    </article >
  );
};

export default PostCard;
