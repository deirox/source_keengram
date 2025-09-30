import cn from "classnames";
import { BaseSyntheticEvent, FC, useEffect, useRef, useState } from "react";
import { BsSuitHeart, BsSuitHeartFill } from "react-icons/bs";
import ReactImageGallery, { ReactImageGalleryItem } from "react-image-gallery";
import { usePostsStore } from "@/shared/store/usePostsStore";
import { useUserStore } from "@/shared/store/useUserStore";
import ModalBody from "@/components/ModalBody";
import styles from "./PostModal.module.css";
import { initialIBigDataWithLength, IPost } from "@/shared/types/api.types";
import MiniComment from "@/components/MiniComment";
import FCPostHeader from "@/entities/PostTopBar";

interface IFCPostModal {
  post: IPost,
  isOpen: boolean;
  onClose: () => void;
}

const PostModal: FC<IFCPostModal> = ({
  post,
  isOpen = false,
  onClose = () => { },
}) => {
  const getComments = usePostsStore(state => state.getComments)
  const { uid = "",
    media = [],
    created_at = 0,
    likes = initialIBigDataWithLength,
    comments = initialIBigDataWithLength,
  } = post

  useEffect(() => {
    if (isOpen === true) {
      const checkcomments = async () => {
        if (comments.data.length < 10 && comments.data.length < comments.length) {
          const getcomments = await getComments(uid)
          usePostsStore.setState({
            posts:
              usePostsStore.getState().posts.map(_post => {
                if (_post.uid === uid) {
                  return {
                    ..._post,
                    comments: { ..._post.comments, data: getcomments.data }
                  }
                } return _post
              })
          })
        }
      }
      checkcomments()
    }

  }, [isOpen])

  const formatedImages = useRef(media.map((m) => {
    return { ...m, original: m.url[m.url.length - 1], thumbnail: m.url[m.url.length - 1] } as ReactImageGalleryItem;
  }));

  const [commentValue, setCommentValue] = useState("");
  const mutateLike = usePostsStore((state) => state.mutateLike);
  const addComment = usePostsStore((state) => state.addComment);
  const isMutatePostsLoading = usePostsStore(
    (state) => state.isMutatePostsLoading,
  );
  const authorizedUserData = useUserStore((state) => state.authorizedUserData);
  const onLike = () => {
    console.log(created_at);
    if (authorizedUserData) {
      mutateLike({
        like_uid: likes.data.length > 0 ? likes.data[0].uid : "",
        postUid: uid,
        userUid: authorizedUserData.uid,
        action: likes.data.length > 0 ? "remove" : "add",
      });
    }
  };
  const onAddComment = async (e: BaseSyntheticEvent) => {
    e.preventDefault();
    if (authorizedUserData && commentValue.length > 0) {
      addComment({ post_uid: uid, author: authorizedUserData, comment_id: post.comments.length, text: commentValue });
      setCommentValue("");
    }
  };
  return (
    <ModalBody
      isModalOpen={isOpen}
      onClose={onClose}
      modalClassname={styles.post_modal}
    >
      <div className={styles.post_modal__box}>
        <div className={styles.post_modal__images}>
          <ReactImageGallery
            lazyLoad
            items={formatedImages.current}
            showBullets={formatedImages.current.length > 1}
            showThumbnails={false}
            showPlayButton={false}
            infinite={false}
            showFullscreenButton={false}
          />
        </div>
        <div className={styles.post_modal__actions}>
          <FCPostHeader authorizedUserData={authorizedUserData} post={post} onConfirm={onClose} />
          <div className={styles.post_modal__comments}>
            {comments.length > 0 ? (
              comments.data.map(({ uid, author, text }) => {
                if (typeof author === "object") {
                  return (
                    <MiniComment
                      key={uid}
                      classname={styles.post_modal__comment}
                      nickname={author.nickname}
                      text={text}
                    />
                  );
                }
                return <></>;
              })
            ) : (
              <div className={styles.post_modal__comments_is_null}>
                <h3>Нет комментариев.</h3>
                <p>Начните переписку.</p>
              </div>
            )}
          </div>
          <div className={styles.post_modal__inner_images}>
            <ReactImageGallery
              items={formatedImages.current}
              showBullets={formatedImages.current.length > 1}
              showThumbnails={false}
              showPlayButton={false}
              infinite={false}
              showFullscreenButton={false}
            />
          </div>
          <div className={styles.post_modal__bottom}>
            <div className={styles.post_modal__buttons}>
              <button
                className={cn(
                  styles.post_modal__button,
                  authorizedUserData
                    ? likes.data.filter(
                      (like) => like.user_uid === authorizedUserData.uid,
                    ).length > 0
                      ? styles.post_modal__button_like
                      : ""
                    : "",
                )}
                onClick={onLike}
              >
                {authorizedUserData &&
                  likes.data.filter(
                    (like) => like.user_uid === authorizedUserData.uid,
                  ).length > 0 ? (
                  <BsSuitHeartFill color="rgb(255, 48, 64)" />
                ) : (
                  <BsSuitHeart color="#fff" />
                )}
              </button>
            </div>

            <p className={styles.post_modal__like_string}>
              {likes.length > 0
                ? likes.length > 1
                  ? `${likes.length} отметок "Нравиться"`
                  : `${likes.length} отметка "Нравиться"`
                : `Поставьте первую отметку "Нравиться"!`}
            </p>
            <form
              className={styles.post_modal__form}
              onSubmit={(e) => {
                onAddComment(e);
              }}
              aria-disabled={isMutatePostsLoading}
            >
              <textarea
                className={styles.post_modal__form_textarea}
                placeholder="Добавьте комментарий..."
                maxLength={200}
                value={commentValue}
                onChange={(e) => setCommentValue(e.target.value)}
              />
              <button className={styles.post_modal__form_button}>
                Опубликовать
              </button>
            </form>
          </div>
        </div>
      </div>
    </ModalBody >
  );
};

export default PostModal;
