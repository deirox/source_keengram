import { FC, memo, useState } from "react";
import { useNavigate } from "react-router-dom";
import StyleziedButton from "@/components/StyleziedButton";
import ChangeAvatarModal from "./ChangeAvatarModal";
import styles from "./UserBio.module.css";
import { IAuthorFull, IAuthorizedUser } from "@/shared/types/api.types";
import utils from "@/shared/utils";
import FCAvatar from "@/shared/ui/Avatar";

interface IFCUserBio {
  // current_nickname?: string | undefined
  userData: IAuthorFull | null;
  authorizedUserData: IAuthorizedUser | null;
  category?: string;
  postsLength: number;
}

const UserBio: FC<IFCUserBio> = memo(({
  // current_nickname = "",
  userData,
  authorizedUserData,
  category = "",
  postsLength = 0,
}) => {
  const navigate = useNavigate();
  const [isChangeAvatarModalOpen, setIsChangeAvatarModalOpen] = useState(false);
  const onClose = () => {
    setIsChangeAvatarModalOpen(false);
  };
  const handleSubscribe = () => { };
  return (
    <div className={styles.userBio}>
      <ChangeAvatarModal
        isModalOpen={isChangeAvatarModalOpen}
        onClose={onClose}
      />
      {authorizedUserData !== null && userData !== null &&
        <div className={styles.userBio__wrapper}>
          <FCAvatar size="xl" author={userData} classnames={{ avatar_classname: `${styles.avatar} ${userData.nickname === authorizedUserData.nickname ? "cursorPointer" : ""}` }} onclick={() =>
            userData.nickname === authorizedUserData.nickname &&
            setIsChangeAvatarModalOpen(true)
          } />
          <div className={styles.userBio__lines}>
            <div className={styles.userBio__line}>
              <p className={styles.userBio__nickname}>{userData.nickname}</p>
              {userData.nickname === authorizedUserData.nickname &&
                <StyleziedButton
                  classname={styles.userBio__button}
                  children={"Редактировать профиль"}
                  onClick={() => {
                    if (userData.nickname === authorizedUserData.nickname) {
                      navigate("/accounts/edit");
                    } else {
                      handleSubscribe();
                    }
                  }}
                  primary={false}
                />
              }

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
                {utils.skloneniye(postsLength, ["публикация", "публикации", "публикаций"])}
              </div>
              <div className={styles.userBio__string}>
                <span className={styles.userBio__string_value}>
                  {userData.subscribers
                    ? userData.subscribers.length
                    : 0}
                </span>{" "}
                {userData.subscribers && utils.skloneniye(userData.subscribers.length, ["подписчик", "подписчика", "подписчиков"])}

              </div>
              <div className={styles.userBio__string}>
                <span className={styles.userBio__string_value}>
                  {userData.subscribed
                    ? userData.subscribed.length
                    : 0}
                </span>{" "}
                {userData.subscribed && utils.skloneniye(userData.subscribed.length, ["подписок", "подписки", "подписок"])}
              </div>
            </div>
            <div className={`${styles.userBio__line} ${styles.userBio__about}`}>
              <div className={`${styles.userBio__about_string} fw500`}>
                {userData.name}{" "}{userData.surname}
              </div>
              <div
                className={`${styles.userBio__about_string} secondary-text--color`}
              >
                {category}
              </div>
              <div className={styles.userBio__about_string}>
                {userData.description}
              </div>
            </div>
          </div>
        </div>
      }

    </div>
  );
})

export default UserBio;
