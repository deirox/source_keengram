import { FC, lazy, memo, Suspense, useState } from "react";
import { BsSuitHeartFill } from "react-icons/bs";
import { FaComment } from "react-icons/fa";
import styles from "./ProfilePagePost.module.css";
import { IPost } from "@/shared/types/api.types";

const PostCardModal = lazy(() => import("@/components/Post/PostModal"));

interface IFCProfilePagePost {
  post: IPost;
}

const ProfilePagePost: FC<IFCProfilePagePost> = memo(({ post }) => {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);

  const onOpen = async () => {
    setIsPostModalOpen(true);
  };
  const onClose = () => {
    setIsPostModalOpen(false);
  };

  const [media_url] = useState(post.media[0].url[post.media[0].url.length - 1]);
  return (
    <>
      <Suspense fallback={<></>}>
        <PostCardModal
          isOpen={isPostModalOpen}
          onClose={onClose}
          post={post}
        />
      </Suspense>

      <div className={styles.profile_page__post} onClick={onOpen}>
        <img src={media_url} alt={media_url} />
        <div className={styles.profile_page__post_hover}>
          <div className={styles.profile_page__post_hover__container}>
            {post.likes.length > 0 && (
              <div className={styles.profile_page__post_hover__item}>
                <BsSuitHeartFill
                  className={styles.profile_page__post_hover__icon}
                />
                <span className={styles.profile_page__post_hover__item_text}>
                  {post.likes.length}
                </span>
              </div>
            )}
            <div className={styles.profile_page__post_hover__item}>
              <FaComment className={styles.profile_page__post_hover__icon} />
              <span className={styles.profile_page__post_hover__item_text}>
                {post.comments.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
})

export default ProfilePagePost;
