import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";
import StyleziedButton from "@/components/StyleziedButton";
import ChangeAvatarModal from "./ChangeAvatarModal";
import styles from "./UserBio.module.css";
import { IAuthorFull, IAuthorizedUser } from "@/shared/types/api.types";

interface IFCUserBio {
  userData: IAuthorFull | null;
  authorizedUserData: IAuthorizedUser | null;
  category?: string;
  postsLength: number;
}

const UserBio: FC<IFCUserBio> = ({
  userData = null,
  authorizedUserData = null,
  category = "",
  postsLength = 0,
}) => {
  const [isChangeAvatarModalOpen, setIsChangeAvatarModalOpen] = useState(false);
  const onClose = () => {
    setIsChangeAvatarModalOpen(false);
  };
  const navigate = useNavigate();
  const handleSubscribe = () => {};

  return (
    <div className={styles.userBio}>
      <ChangeAvatarModal
        isModalOpen={isChangeAvatarModalOpen}
        onClose={onClose}
      />
      <div className={styles.userBio__wrapper}>
        <div
          className={`${styles.avatar} ${
            userData?.nickname === authorizedUserData?.nickname
              ? "cursorPointer"
              : ""
          }`}
          onClick={() =>
            userData?.nickname === authorizedUserData?.nickname &&
            setIsChangeAvatarModalOpen(true)
          }
        >
          <img
            src={userData?.avatar.url}
            onError={({ currentTarget }) => {
              currentTarget.onerror = null; // prevents looping
              currentTarget.src = "/keengram/img/EmptyAvatar.jpg";
            }}
            alt={`${userData?.nickname} avatar`}
          />
        </div>
        <div className={styles.userBio__lines}>
          <div className={styles.userBio__line}>
            <p className={styles.userBio__nickname}>{userData?.nickname}</p>
            <StyleziedButton
              classname={styles.userBio__button}
              children={
                userData?.nickname === authorizedUserData?.nickname
                  ? "Редактировать профиль"
                  : "Подписаться"
              }
              onClick={() => {
                if (userData?.nickname === authorizedUserData?.nickname) {
                  navigate("/accounts/edit");
                } else {
                  handleSubscribe();
                }
              }}
              primary={userData?.nickname !== authorizedUserData?.nickname}
            />
            {/* <StyleziedButton
              classname={styles.userBio__button}
              children={"Рекламные инструменты"}
              onClick={() => console.log(1)}
            /> */}
          </div>
          <div className={styles.userBio__line}>
            <div className={styles.userBio__string}>
              <span className={styles.userBio__string_value}>
                {postsLength}
              </span>{" "}
              публикаций
            </div>
            <div className={styles.userBio__string}>
              <span className={styles.userBio__string_value}>
                {typeof userData?.subscribers === "number"
                  ? userData?.subscribers
                  : userData?.subscribers.length}
              </span>{" "}
              подписчиков
            </div>
            <div className={styles.userBio__string}>
              <span className={styles.userBio__string_value}>
                {typeof userData?.subscribed === "number"
                  ? userData?.subscribed
                  : userData?.subscribed.length}
              </span>{" "}
              подписок
            </div>
          </div>
          <div className={`${styles.userBio__line} ${styles.userBio__about}`}>
            <div className={`${styles.userBio__about_string} fw500`}>
              {userData?.name}
            </div>
            <div
              className={`${styles.userBio__about_string} secondary-text--color`}
            >
              {category}
            </div>
            <div className={styles.userBio__about_string}>
              {userData?.description}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserBio;
