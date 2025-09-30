import { useCallback, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useUserStore } from "@/shared/store/useUserStore";
import { usePostsStore } from "@/shared/store/usePostsStore";
import UserBio from "@/components/UserBio";
import ErrorComponent from "@/components/ErrorComponent";
import LoaderComponent from "@/components/LoaderComponent";
import { IAuthorFull, IAuthorizedUser } from "@/shared/types/api.types";
import ProfilePagePost from "./ProfilePagePost";
import styles from "./ProfilePage.module.css";

const ProfilePage = () => {
  const getUser = useUserStore((state) => state.getUser);
  const isUserLoading = useUserStore((state) => state.isUserLoading);
  const isUserError = useUserStore((state) => state.isUserError);
  const authorizedUserData = useUserStore((state) => state.authorizedUserData) as IAuthorizedUser | null
  const userData = useUserStore((state) => state.userData) as IAuthorFull | null
  const getUserPosts = usePostsStore((state) => state.getUserPosts);
  const posts = usePostsStore((state) => state.posts);
  const isPostsLoading = usePostsStore((state) => state.isPostsLoading);
  const isPostsError = usePostsStore((state) => state.isPostsError);

  const { userNickname } = useParams();
  const get = useCallback(async () => {
    const checkIsUserData = (userNickname: string | undefined, userData: IAuthorFull | null) => {
      if (userNickname) {
        if (userData) {
          if (userNickname === userData.nickname) {
            if (userData.type === 'IAuthorFull' || userData.type === 'IAuthorizedUser') {
              return true
            }
          }
        }
      }
      return false
    }
    const isUserData = checkIsUserData(userNickname, userData)
    const user = isUserData ? userData : await getUser<IAuthorFull>({
      by: "nickname",
      data: userNickname && typeof userNickname === "string" ? userNickname : "",
      return_type: "IAuthorFull",
    });

    if (user !== null) {
      if (!isUserData) {
        useUserStore.setState({ userData: user })
      }
      if (user.posts.length > 0) {
        getUserPosts(user.uid);
      } else {
        usePostsStore.setState({ isPostsLoading: false, posts: [] })
      }
    }
  }, [userNickname])

  useEffect(() => {
    if (userNickname && typeof userNickname === 'string') {
      if (import.meta.hot && userData?.nickname === userNickname && isPostsLoading) return
      get();
    }
  }, [userNickname, import.meta.hot]);
  return (
    <>
      {isUserLoading && userData === null ? (
        isUserError ? (
          <ErrorComponent text="isUserError" />
        ) : (
          <LoaderComponent />
        )
      ) : userData && (
        <div className="container container__profile">
          <UserBio
            userData={userData}
            authorizedUserData={authorizedUserData}
            postsLength={userData.posts ? userData.posts.length : 0}
          />
          {isPostsLoading ? (
            isPostsError ? (
              <ErrorComponent text="isPostsError" />
            ) : (
              <LoaderComponent />
            )
          ) : userData.posts && userData.posts.length === 0 ? (
            <p
              style={{
                display: "block",
                textAlign: "center",
                color: "rgb(var(--ig-secondary-text))",
              }}
            >
              У данного пользователя нет постов!
            </p>
          ) : (
            <div className={styles.profile_page__posts}>
              {posts.length > 0 && posts.map((post) => (
                <ProfilePagePost key={post.uid} post={post} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ProfilePage;
