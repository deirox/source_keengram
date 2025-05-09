import ReactImageGallery, { ReactImageGalleryItem } from "react-image-gallery";
import styles from "./GeneratePost.module.css";
import { TUserInterfaces } from "@/shared/types/api.types";

interface IGeneratePost {
  active: boolean;
  images: ReactImageGalleryItem[];
  postDesc: string;
  setPostDesc: (value: string) => void;
  authorizedUserData: TUserInterfaces;
}

const GeneratePost = ({
  active = false,
  images = [],
  postDesc = "",
  setPostDesc = () => {},
  authorizedUserData,
}: IGeneratePost) => {
  return (
    <>
      {active && (
        <div className={styles.generate_post__root}>
          <div className={styles.generate_post__gallery}>
            <ReactImageGallery
              items={images}
              showBullets
              showThumbnails={false}
              showPlayButton={false}
              infinite={false}
            />
          </div>
          <div className={styles.generate_post__box}>
            <div className={styles.generate_post__badge}>
              <img
                className={styles.generate_post__avatar}
                src={authorizedUserData.avatar.url}
                alt={authorizedUserData.avatar.url}
              />
              <p className={styles.generate_post__nickname}>
                {authorizedUserData.nickname}
              </p>
            </div>
            <textarea
              className={styles.generate_post__textarea}
              placeholder="Добавьте подпись..."
              maxLength={2200}
              rows={8}
              value={postDesc}
              onChange={(e) => setPostDesc(e.target.value)}
            />
            <p className={styles.generate_post__textarea___length}>
              {postDesc.length}/2200
            </p>
          </div>
        </div>
      )}
    </>
  );
};
export default GeneratePost;
