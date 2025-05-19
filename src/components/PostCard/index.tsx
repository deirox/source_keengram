import dayjs from "dayjs";
import { BaseSyntheticEvent, FC, lazy, Suspense, useState } from "react";
import { BsSuitHeart, BsSuitHeartFill } from "react-icons/bs";
import { FaRegComment } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useUserStore } from "@/shared/store/useUserStore";
import { usePostsStore } from "@/shared/store/usePostsStore";
// import MiniComment from "@/components/MiniComment";
import styles from "./PostCard.module.css";
import cn from "classnames";
import ReactImageGallery from "react-image-gallery";

const PostCardModal = lazy(() => import("./PostCardModal"));

import relativeTime from "dayjs/plugin/relativeTime";
import { initialIFirebaseCreatedAt, IPost } from "@/shared/types/api.types";
import MiniComment from "../MiniComment";
dayjs.extend(relativeTime);

const PostCard: FC<IPost> = (post) => {
  const {
    uid = "",
    media = [],
    likes = { data: [], length: 0 },
    comments = { data: [], length: 0 },
    author,
    created_at = initialIFirebaseCreatedAt,
  } = post;
  const authorizedUserData = useUserStore((state) => state.authorizedUserData);
  const mutateLike = usePostsStore((state) => state.mutateLike);
  const isMutatePostsLoading = usePostsStore(
    (state) => state.isMutatePostsLoading,
  );
  const addComment = usePostsStore((state) => state.addComment);
  const [comment, setComment] = useState("");
  const [isPostCardModalOpen, setIsPostCardModalOpen] = useState(false);

  const formatedImages = media.map((m) => {
    return { ...m, original: m.url, thumbnail: m.url };
  });

  const onLike = () => {
    if (authorizedUserData) {
      console.log("likes", likes);
      mutateLike({
        like_uid: likes.data.length > 0 ? likes.data[0].uid : "",
        postUid: uid,
        userUid: authorizedUserData.uid,
        action: likes.data.length > 0 ? "remove" : "add",
      });
    }
  };
  const onAddComment = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    if (comment.length > 0 && authorizedUserData) {
      addComment(uid, authorizedUserData.uid, comment);
      setComment("");
    }
  };
  const onModalOpen = () => {
    setIsPostCardModalOpen(true);
  };
  const onModalClose = () => {
    setIsPostCardModalOpen(false);
  };
  return (
    <article className={styles.post_card}>
      <Suspense fallback={<></>}>
        <PostCardModal
          uid={uid}
          media={media}
          created_at={created_at}
          likes={likes}
          comments={comments}
          author={author}
          isOpen={isPostCardModalOpen}
          onClose={onModalClose}
          post_weight={post.post_weight}
        />
      </Suspense>
      {typeof author !== "string" && author.avatar && (
        <div className={styles.post_card__header}>
          <div className={styles.post_card__post_card__author_avatar}>
            <img
              src={author.avatar.url}
              onError={({ currentTarget }) => {
                currentTarget.onerror = null; // prevents looping
                currentTarget.src = "img/EmptyAvatar.jpg";
              }}
              alt={author.avatar.url}
            />
          </div>
          <div className={styles.post_card__author_bio}>
            <div className={styles.post_card__author_bio__top}>
              <Link
                className={styles.post_card__author_nickname}
                to={author.nickname}
              >
                {author.nickname}
              </Link>
              <span className="_ac6e _ac6g _ac6h">•</span>

              <time
                className={`_ac6g ${styles.post_card__created_date}`}
                dateTime={dayjs.unix(created_at.seconds).toString()}
                title={dayjs.unix(created_at.seconds).format("MMM D, YYYY")}
              >
                {dayjs.unix(created_at.seconds).fromNow()}
              </time>
            </div>
            <div className={styles.post_card__author_bio__bottom}></div>
          </div>
        </div>
      )}
      <div className={styles.post_card__picture}>
        <ReactImageGallery
          items={formatedImages}
          showBullets={formatedImages.length > 1}
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
            <FaRegComment color="#fff" onClick={onModalOpen} />
          </button>
        </div>

        <p className={styles.post_card__like_string}>
          {likes.length > 0
            ? likes.length > 1
              ? `${likes.length} отметок "Нравиться"`
              : `${likes.length} отметка "Нравиться"`
            : `Поставьте первую отметку "Нравиться"!`}
        </p>
        {comments.length > 0 && (
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
            onClick={onModalOpen}
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
    </article>
  );
};

export default PostCard;
