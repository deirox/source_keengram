import cn from "classnames";
import { FC } from "react";
import { BsSuitHeart, BsSuitHeartFill } from "react-icons/bs";
import { FaRegComment } from "react-icons/fa";
import ReactImageGallery from "react-image-gallery";
import { Link } from "react-router-dom";
import { usePostsStore } from "@/shared/store/usePostsStore";
import { useUserStore } from "@/shared/store/useUserStore";
// import MiniComment from "@/components/MiniComment";
import ModalBody from "@/components/ModalBody";
import styles from "./PostCardModal.module.css";
import { IPost } from "@/shared/types/api.types";

interface IFCPostCardModal extends Omit<IPost, "t"> {
  isOpen: boolean;
  onClose: () => void;
}

const PostCardModal: FC<IFCPostCardModal> = ({
  uid = "",
  media = [],
  created_at = 0,
  likes,
  comments = [],
  author,
  isOpen = false,
  onClose = () => {},
}) => {
  const formatedImages = media.map((m) => {
    return { ...m, original: m.url, thumbnail: m.url };
  });
  // const [commentValue, setCommentValue] = useState("");
  const mutateLike = usePostsStore((state) => state.mutateLike);
  // const addComment = usePostsStore((state) => state.addComment);
  // const isMutatePostsLoading = usePostsStore(
  //   (state) => state.isMutatePostsLoading,
  // );
  const authorizedUserData = useUserStore((state) => state.authorizedUserData);
  const onLike = () => {
    console.log(created_at, comments);
    if (authorizedUserData) {
      mutateLike(uid, authorizedUserData.uid);
    }
  };
  // const onAddComment = async (e) => {
  //   e.preventDefault();
  //   if (commentValue.length > 0) {
  //     await addComment(
  //       uid,
  //       authorizedUserData.nickname,
  //       commentValue,
  //       isUserPosts && true,
  //     );
  //     setCommentValue("");
  //   }
  // };
  //
  return (
    <ModalBody
      isModalOpen={isOpen}
      onClose={onClose}
      modalClassname={styles.post_card_modal}
    >
      <div className={styles.post_card_modal__box}>
        <div className={styles.post_card_modal__images}>
          <ReactImageGallery
            items={formatedImages}
            showBullets={formatedImages.length > 1}
            showThumbnails={false}
            showPlayButton={false}
            infinite={false}
            showFullscreenButton={false}
          />
        </div>

        <div className={styles.post_card_modal__actions}>
          {typeof author === "object" && (
            <div className={styles.post_card_modal__top}>
              <img
                className={styles.post_card_modal__author_avatar}
                src={author.avatar.url}
                alt={author.avatar.url}
              />

              <Link
                className={styles.post_card_modal__author_nickname}
                to={`/${author.nickname}`}
              >
                {author.nickname}
              </Link>
            </div>
          )}

          {/* <div className={styles.post_card_modal__comments}>
            {comments.length > 0 likes? (
              comments.map(({ nickname, text }, index) => (
                <MiniComment
                  key={index}
                  classname={styles.post_card_modal__comment}
                  nickname={nickname}
                  text={text}
                />
              ))
            ) : (
              <div className={styles.post_card_modal__comments_is_null}>
                <h3>Нет комментариев.</h3>
                <p>Начните переписку.</p>
              </div>
            )}
          </div> */}
          <div className={styles.post_card_modal__inner_images}>
            <ReactImageGallery
              items={formatedImages}
              showBullets={formatedImages.length > 1}
              showThumbnails={false}
              showPlayButton={false}
              infinite={false}
              showFullscreenButton={false}
            />
          </div>
          <div className={styles.post_card_modal__bottom}>
            <div className={styles.post_card_modal__buttons}>
              <button
                className={cn(
                  styles.post_card_modal__button,
                  authorizedUserData
                    ? likes.data.includes(authorizedUserData.uid)
                      ? styles.post_card_modal__button_like
                      : ""
                    : "",
                )}
                onClick={onLike}
              >
                {authorizedUserData &&
                likes.data.includes(authorizedUserData.uid) ? (
                  <BsSuitHeartFill color="rgb(255, 48, 64)" />
                ) : (
                  <BsSuitHeart color="#fff" />
                )}
              </button>
              <button className={styles.post_card_modal__button}>
                <FaRegComment color="#fff" />
              </button>
            </div>

            <p className={styles.post_card_modal__like_string}>
              {likes.data.length > 0
                ? likes.data.length > 1
                  ? `${likes.data.length} отметок "Нравиться"`
                  : `${likes.data.length} отметка "Нравиться"`
                : `Поставьте первую отметку "Нравиться"!`}
            </p>
            {/* <form
              className={styles.post_card_modal__form}
              onSubmit={(e) => {
                onAddComment(e);
              }}
              aria-disabled={isMutatePostsLoading}
            >
              <textarea
                className={styles.post_card_modal__form_textarea}
                type="text"
                placeholder="Добавьте комментарий..."
                maxLength={200}
                value={commentValue}
                onChange={(e) => setCommentValue(e.target.value)}
                resize="none"
              />
              <button className={styles.post_card_modal__form_button}>
                Опубликовать
              </button>
            </form> */}
          </div>
        </div>
      </div>
    </ModalBody>
  );
};

export default PostCardModal;
