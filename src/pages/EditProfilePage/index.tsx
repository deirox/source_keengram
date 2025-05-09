import { getAuth, signOut } from "firebase/auth";
import { BaseSyntheticEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "@/shared/store/useUserStore";
import StyleziedButton from "@/components/StyleziedButton";
import styles from "./EditProfilePage.module.css";
import { IAuthorizedUser } from "@/shared/types/api.types";

const EditProfilePage = () => {
  const [usernameValue, setUsernameValue] = useState("");
  const [nicknameValue, setNicknameValue] = useState("");
  const [descriptionValue, setDescriptionValue] = useState("");

  const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  const authorizedUserData = useUserStore(
    (state) => state.authorizedUserData,
  ) as IAuthorizedUser | null;
  const mutateUserData = useUserStore((state) => state.mutateUserData);
  const isMutateUserLoading = useUserStore(
    (state) => state.isMutateUserLoading,
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (authorizedUserData) {
      setUsernameValue(authorizedUserData.name);
      setNicknameValue(authorizedUserData.nickname);
      setDescriptionValue(authorizedUserData.description);
    }
  }, [authorizedUserData]);
  useEffect(() => {
    if (isMutateUserLoading) {
      setIsButtonDisabled(true);
      return;
    }
    if (authorizedUserData) {
      if (usernameValue !== authorizedUserData.name) {
        setIsButtonDisabled(false);
      } else if (nicknameValue !== authorizedUserData.nickname) {
        setIsButtonDisabled(false);
      } else if (descriptionValue !== authorizedUserData.description) {
        setIsButtonDisabled(false);
      } else {
        setIsButtonDisabled(true);
      }
    }
  }, [
    usernameValue,
    nicknameValue,
    descriptionValue,
    isMutateUserLoading,
    authorizedUserData,
  ]);

  const handleSubmit = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    if (authorizedUserData) {
      mutateUserData({
        userUid: authorizedUserData.uid,
        username: usernameValue,
        nickname: nicknameValue,
        description: descriptionValue,
      });
    }
  };
  const handleEscape = () => {
    try {
      const auth = getAuth();
      signOut(auth)
        .then(() => {
          // Sign-out successful.
          // navigate("/accounts/login");
          // navigate("/accounts/login");
          console.log("signOut");
          // setIsSignedOut(true);
          // navigate("/accounts/login");
        })
        .catch((error) => {
          // An error happened.
          console.error(error);
        });
      // setAuthorizedUser({
      //   uid: user.uid,
      //   accessToken: user.accessToken,
      //   email: user.email,
      // });
      // getAuthorizedUser(user);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const errorCode = error.code;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      const errorMessage = error.message;
      console.log("errorCode: ", errorCode, "errorMessage: ", errorMessage);
    }
  };

  return (
    <div className={styles.edit_profile_page__root}>
      <div className={styles.edit_profile_page__top}>
        <button
          className={styles.edit_profile_page__top_btn}
          onClick={() =>
            navigate(
              authorizedUserData ? `/${authorizedUserData.nickname}` : "/",
            )
          }
        >
          <svg
            aria-label="Назад"
            className="relative_block"
            color="rgb(245, 245, 245)"
            fill="rgb(245, 245, 245)"
            height="24"
            role="img"
            viewBox="0 0 24 24"
            width="24"
          >
            <path d="M21 17.502a.997.997 0 0 1-.707-.293L12 8.913l-8.293 8.296a1 1 0 1 1-1.414-1.414l9-9.004a1.03 1.03 0 0 1 1.414 0l9 9.004A1 1 0 0 1 21 17.502Z"></path>
          </svg>
        </button>
        <p>Редактировать профиль</p>
      </div>
      <div className={styles.edit_profile_page__box_wrapper}>
        <article className={styles.edit_profile_page__box}>
          <form
            className={styles.edit_profile_page__items}
            onSubmit={handleSubmit}
            aria-disabled={isButtonDisabled}
          >
            <div className={styles.edit_profile_page__item}>
              <aside className={styles.edit_profile_page__item_title}>
                Имя
              </aside>
              <div className={styles.edit_profile_page__item__input_box}>
                <input
                  className={styles.edit_profile_page__item__input}
                  value={usernameValue}
                  onChange={(e) => setUsernameValue(e.target.value)}
                />
                <div className={styles.edit_profile_page__item__text}>
                  Чтобы людям было проще находить ваш аккаунт, используйте имя,
                  под которым вас знают: ваше имя и фамилию, никнейм или
                  название компании.
                </div>
              </div>
            </div>
            <div className={styles.edit_profile_page__item}>
              <aside className={styles.edit_profile_page__item_title}>
                Имя пользователя
              </aside>
              <div className={styles.edit_profile_page__item__input_box}>
                <input
                  className={styles.edit_profile_page__item__input}
                  value={nicknameValue}
                  onChange={(e) => setNicknameValue(e.target.value)}
                />
                <div className={styles.edit_profile_page__item__text}>
                  В большинстве случаев у вас будет ещё 14 дней, чтобы снова
                  изменить имя пользователя на прежнее.
                </div>
              </div>
            </div>
            <div className={styles.edit_profile_page__item}>
              <aside className={styles.edit_profile_page__item_title}>
                О себе
              </aside>
              <div className={styles.edit_profile_page__item__input_box}>
                <textarea
                  className={styles.edit_profile_page__item__input}
                  value={descriptionValue}
                  onChange={(e) => setDescriptionValue(e.target.value)}
                  maxLength={150}
                />
                <div className={styles.edit_profile_page__item__text_title}>
                  {descriptionValue.length} / 150
                </div>
                <div className={styles.edit_profile_page__item__text}>
                  <div className={styles.edit_profile_page__item__text_title}>
                    Личная информация
                  </div>
                  Укажите личную информацию, даже если аккаунт используется для
                  компании, домашнего животного или в других целях. Эти сведения
                  не будут показываться в вашем общедоступном профиле.
                </div>
              </div>
            </div>
            <div className={styles.edit_profile_page__item}>
              <aside className={styles.edit_profile_page__item_title}></aside>
              <StyleziedButton
                disabled={isButtonDisabled}
                primary
                children="Отправить"
              />
            </div>
          </form>
        </article>
      </div>
      <button
        className={styles.edit_profile_page__escape_btn}
        onClick={handleEscape}
      >
        Выйти из аккаунта
      </button>
    </div>
  );
};

export default EditProfilePage;
