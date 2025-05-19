import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { BaseSyntheticEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "@/shared/api/firebase";
import { useUserStore } from "@/shared/store/useUserStore";
import styles from "./SignUp.module.css";
import { IAuthorizedUser, TUserInterfaces } from "@/shared/types/api.types";

const SignUp = () => {
  const [emailValue, setEmailValue] = useState("");
  const [username, setUsername] = useState("");
  const [nickname, setNickname] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  const setAuthorizedUser = useUserStore((state) => state.setAuthorizedUser);
  const authorizedUserData = useUserStore(
    (state) => state.authorizedUserData,
  ) as IAuthorizedUser | null;

  const navigate = useNavigate();

  useEffect(() => {
    if (authorizedUserData && authorizedUserData.isAuth) {
      navigate("/");
    }
  }, []);

  const isBtnDisabled = () => {
    if (emailValue.length > 0 && passwordValue.length > 5) {
      return false;
    }
    return true;
  };

  const handleSignUp = async (email: string, password: string) => {
    const auth = getAuth();

    try {
      const { user } = await setPersistence(auth, browserLocalPersistence).then(
        () => {
          return createUserWithEmailAndPassword(auth, email, password);
        },
      );
      setAuthorizedUser({
        uid: user.uid,
        accessToken: user.refreshToken,
        email: user.email,
      } as TUserInterfaces);
      await setDoc(doc(db, "users", user.uid), {
        username: username,
        nickname: nickname,
        avatar: { url: "img/EmptyAvatar.jpg" },
        description: "",
        url: "",
        subscribers: [],
        subscribed: [],
      });
      navigate("/");
    } catch (error) {
      console.log(error);
    }
  };

  const onFormSubmit = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    handleSignUp(emailValue, passwordValue);
  };

  return (
    <div className={styles.login_page__root}>
      <div className={styles.login_page__wrapper}>
        <div className={styles.login_page__box}>
          <div className={styles.login_page__logo}>
            <img src="img/logo.png" alt="black logo keengram" />
          </div>
          <form
            className={styles.login_page__form}
            onSubmit={(e) => onFormSubmit(e)}
          >
            {/* <label className="_aa48">
              <span className="_aa4a">Пароль</span>
              <input
                className={styles.login_page__form__input}
                placeholder="Имя пользователя"
                type="text"
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                aria-required={true}
                autoCapitalize="off"
                autoCorrect="off"
              />
            </label> */}
            <input
              className={styles.login_page__form__input}
              placeholder="Эл.адрес"
              type="email"
              value={emailValue}
              onChange={(e) => setEmailValue(e.target.value)}
              aria-required={true}
              autoCapitalize="off"
              autoCorrect="off"
            />
            <input
              className={styles.login_page__form__input}
              placeholder="Имя и фамилия"
              type="text"
              minLength={5}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-required={true}
              autoCapitalize="off"
              autoCorrect="off"
            />
            <input
              className={styles.login_page__form__input}
              placeholder="Имя пользователя"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              aria-required={true}
              autoCapitalize="off"
              autoCorrect="off"
            />
            <input
              className={styles.login_page__form__input}
              placeholder="Пароль"
              type="password"
              minLength={5}
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              aria-required={true}
              autoCapitalize="off"
              autoCorrect="off"
            />
            <button
              className={styles.login_page__form__btn}
              type="submit"
              disabled={isBtnDisabled()}
            >
              Регистрация
            </button>
          </form>
        </div>
        <div className={styles.login_page__box}>
          <p>
            Есть аккаунт? <Link to="/accounts/login">Вход</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
