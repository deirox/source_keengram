import { useEffect, useRef } from "react";

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import MetaNavigation from "@/components/MetaNavigaton";
import styles from "./app.module.css";

import { useUserStore } from "@/shared/store/useUserStore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import LoaderComponent from "@/components/LoaderComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { IAuthorizedUser } from "@/shared/types/api.types";

import { Crypto } from "@/shared/utils/cripto";


export default function App() {
  const location = useLocation();
  const isAuthorizedUserError = useUserStore(
    (state) => state.isAuthorizedUserError,
  );
  const authorizedUserData = useUserStore(
    (state) => state.authorizedUserData,
  );

  const isAuthorizedUserLoading = useUserStore(
    (state) => state.isAuthorizedUserLoading,
  );

  const getUser = useUserStore((state) => state.getUser);
  const setAuthorizedUser = useUserStore((state) => state.setAuthorizedUser);
  const setAuthorizedUserLoading = useUserStore(
    (state) => state.setAuthorizedUserLoading,
  );

  const effectRun = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        const u = await getUser<IAuthorizedUser>({
          by: "uid",
          data: user.uid,
          isAuthorized: true,
          return_type: "IAuthorizedUser",
        });
        setAuthorizedUser({ ...u, ...user, isAuth: true } as unknown as IAuthorizedUser);



        // console.log('private_key', await Crypto.importPrivateKey(private_key))
        // const encryptedKeyDoc = await getDoc(doc(firestore, "users", user.uid, 'meta', 'encrypted_keys'))

        // if (!encryptedKeyDoc.data()) {
        //   console.error("Ключи данного пользователя не найдены!");
        //   auth.signOut()
        // }
        // const { private_key, iv, salt } = encryptedKeyDoc.data() as IEncryptedKeyPBKDF2AESGCM
        // const privateKey = await Crypto.decryptPrivateKeyWithPassword(private_key, salt, iv, password)
        // await Crypto.saveEncryptedKeyToDB(privateKey)
        // setAuthorizedUser({
        //   ...u,
        //   uid: user.uid,
        //   accessToken: user.refreshToken,
        //   email: user.email,
        // } as IAuthorizedUser);


      } else {
        console.error("Данный пользователь не найден!");
        setAuthorizedUser(null);
        setAuthorizedUserLoading(false);
        navigate("/accounts/login");

        // User is signed out
      }
      return
    });

    if (!effectRun.current) {
      return () => {
        effectRun.current = true;
      };
    }


  }, [navigate, getUser, setAuthorizedUser, setAuthorizedUserLoading]);

  useEffect(() => {
    const auth = getAuth();
    async function chechUserPK() {
      if (!authorizedUserData) return
      const k: Record<number, string> = await Crypto.getEncryptedKeyFromDB()
      if (!authorizedUserData.public_key || !k) {
        await signOut(auth)
      }
    }
    chechUserPK()
  }, [authorizedUserData])

  return (
    <div
      className={`${styles.app__wrapper}`}
      style={{
        display: !location.pathname.includes("accounts") ? "grid" : "block",
      }}
    >
      {isAuthorizedUserLoading ? (
        isAuthorizedUserError ? (
          <ErrorComponent />
        ) : (
          <LoaderComponent />
        )
      ) : (
        <>
          {!location.pathname.includes("accounts") && <MetaNavigation />}

          <Outlet />
        </>
      )}
    </div>
  );
}
