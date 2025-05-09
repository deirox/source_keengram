import { useEffect, useRef } from "react";

import { Outlet, useLocation, useNavigate } from "react-router-dom";
import MetaNavigation from "@/components/MetaNavigaton";
import styles from "./app.module.css";

import { useUserStore } from "@/shared/store/useUserStore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import LoaderComponent from "@/components/LoaderComponent";
import ErrorComponent from "@/components/ErrorComponent";
import { IAuthor } from "@/shared/types/api.types";

export default function App() {
  const location = useLocation();

  const isAuthorizedUserError = useUserStore(
    (state) => state.isAuthorizedUserError,
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
    onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        setAuthorizedUser(user as unknown as IAuthor);
        // navigate("/");
        getUser({
          by: "uid",
          data: user.uid,
          isAuthorized: true,
          return_type: "IAuthorizedUser",
        });
      } else {
        console.log("Данный пользователь не найден!");
        setAuthorizedUser(null);
        setAuthorizedUserLoading(false);
        navigate("/accounts/login");

        // User is signed out
      }
      return user;
    });

    if (!effectRun.current) {
      return () => {
        effectRun.current = true;
      };
    }
  }, [navigate, getUser, setAuthorizedUser, setAuthorizedUserLoading]);

  // console.log("isAuthorizedUserLoading", isAuthorizedUserLoading);
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
