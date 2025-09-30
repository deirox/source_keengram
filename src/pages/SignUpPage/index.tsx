import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { BaseSyntheticEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { firestore } from "@/shared/api/firebase";
import { useUserStore } from "@/shared/store/useUserStore";
import styles from "./SignUp.module.css";
import {
  IAuthorizedUser,
  initialIAuthorizedUser,
  initialIUserMetaInfo,
} from "@/shared/types/api.types";
import { Crypto } from "@/shared/utils/cripto";

const SignUp = () => {
  const [passwordValue, setPasswordValue] = useState("");

  const [newUser, setNewUser] = useState<
    Pick<IAuthorizedUser, "avatar" | "description" | "name" | "nickname" | "surname" | "public_key" | "email">
  >({
    avatar: { url: "" }, description: "", name: "", nickname: "", surname: "", public_key: "", email: ""
  });

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
    if (newUser.email && newUser.email.length > 0 && passwordValue.length > 5) {
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

      const { publicKey, privateKey } = await Crypto.generateKeyPair()

      await Crypto.saveEncryptedKeyToDB({ private_key: privateKey })

      const { encryptedKey, salt, iv } = await Crypto.encryptPrivateKeyWithPassword(privateKey, password)

      setAuthorizedUser({
        ...initialIAuthorizedUser,
        ...newUser,
        uid: user.uid,
        accessToken: user.refreshToken,
        email: user.email,
        public_key: publicKey,
      } as IAuthorizedUser);
      await setDoc(doc(firestore, "users", user.uid), {
        ...newUser,
        created_at: serverTimestamp()
      });
      await setDoc(doc(firestore, "users", user.uid, 'meta', 'info'), initialIUserMetaInfo);
      await setDoc(doc(firestore, "users", user.uid, 'meta', 'encryted_keys'), {
        private_key: encryptedKey,
        salt,
        iv
      });
      navigate("/");
    } catch (error) {
      console.error(error);
    }
  };

  const onFormSubmit = (e: BaseSyntheticEvent) => {
    e.preventDefault();

    const characters_arr = [
      " ",
      "/",
      "audios",
      "author",
      "accounts",
      "login",
      "emailsignup",
      "edit",
    ];

    if (
      !characters_arr.some((item) =>
        newUser.nickname.toLowerCase().includes(item.toLowerCase()),
      ) &&
      newUser.email
    ) {
      handleSignUp(newUser.email, passwordValue);
    }
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
              value={newUser.email}
              onChange={(e) =>
                setNewUser((user) => ({ ...user, email: e.target.value }))
              }
              aria-required={true}
              autoCapitalize="off"
              autoCorrect="off"
            />
            <input
              className={styles.login_page__form__input}
              placeholder="Имя"
              type="text"
              minLength={1}
              value={newUser.name}
              onChange={(e) =>
                setNewUser((user) => ({ ...user, name: e.target.value }))
              }
              aria-required={true}
              autoCapitalize="off"
              autoCorrect="off"
            />
            <input
              className={styles.login_page__form__input}
              placeholder="Фамилия"
              type="text"
              minLength={5}
              value={newUser.surname}
              onChange={(e) =>
                setNewUser((user) => ({ ...user, surname: e.target.value }))
              }
              aria-required={true}
              autoCapitalize="off"
              autoCorrect="off"
            />
            <input
              className={styles.login_page__form__input}
              placeholder="Имя пользователя"
              type="text"
              value={newUser.nickname}
              onChange={(e) =>
                setNewUser((user) => ({ ...user, nickname: e.target.value.trim() }))
              }
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
