import { BaseSyntheticEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./LoginPage.module.css";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useUserStore } from "../../shared/store/useUserStore";
import { IAuthorizedUser } from "@/shared/types/api.types";

const LoginPage = () => {
  const [emailValue, setEmailValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");

  const setAuthorizedUser = useUserStore((state) => state.setAuthorizedUser);
  const getUser = useUserStore((state) => state.getUser);
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

  const handleLogin = async (email: string, password: string) => {
    try {
      const auth = getAuth();
      const { user } = await setPersistence(auth, browserLocalPersistence).then(
        () => {
          return signInWithEmailAndPassword(auth, email, password);
        },
      );
      setAuthorizedUser({
        uid: user.uid,
        accessToken: user.refreshToken,
        email: user.email,
      } as IAuthorizedUser);
      getUser({
        by: "uid",
        data: user.uid,
        isAuthorized: true,
        return_type: "IAuthorizedUser",
      });
      navigate("/");
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
  const onFormSubmit = (e: BaseSyntheticEvent) => {
    e.preventDefault();
    handleLogin(emailValue, passwordValue);
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
              Войти
            </button>
          </form>
        </div>
        <div className={styles.login_page__box}>
          <p>
            У вас ещё нет аккаунта?{" "}
            <Link to="/accounts/emailsignup">Зарегистрироваться</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
