import { FC, lazy, Suspense, useState } from "react";
import { BsSuitHeartFill } from "react-icons/bs";
import { FaComment } from "react-icons/fa";
import styles from "./ProfilePagePost.module.css";
import { IPost } from "@/shared/types/api.types";

const PostCardModal = lazy(() => import("@/components/PostCard/PostCardModal"));

interface IFCProfilePagePost {
  post: IPost;
}

const ProfilePagePost: FC<IFCProfilePagePost> = ({ post }) => {
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const onOpen = () => {
    setIsPostModalOpen(true);
  };
  const onClose = () => {
    setIsPostModalOpen(false);
  };
  return (
    <>
      <Suspense fallback={<>loading</>}>
        <PostCardModal
          isOpen={isPostModalOpen}
          onClose={onClose}
          author={post.author}
          comments={post.comments}
          created_at={post.created_at}
          media={post.media}
          likes={post.likes}
          uid={post.uid}
          post_weight={0}
        />
      </Suspense>

      <div className={styles.profile_page__post} onClick={onOpen}>
        <img src={post.media[0].url} alt={post.media[0].url} />
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
};

export default ProfilePagePost;
