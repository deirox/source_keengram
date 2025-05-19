import { useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useUserStore } from "@/shared/store/useUserStore";
import { usePostsStore } from "@/shared/store/usePostsStore";
import UserBio from "@/components/UserBio";
import styles from "./ProfilePage.module.css";
import ErrorComponent from "@/components/ErrorComponent";
import LoaderComponent from "@/components/LoaderComponent";
import ProfilePagePost from "./ProfilePagePost";
import { IAuthorFull } from "@/shared/types/api.types";

const ProfilePage = () => {
  const isUserLoading = useUserStore((state) => state.isUserLoading);
  const isUserError = useUserStore((state) => state.isUserError);
  const userData = useUserStore((state) => state.userData);
  const getUser = useUserStore((state) => state.getUser);
  const authorizedUserData = useUserStore((state) => state.authorizedUserData);
  const getUserPosts = usePostsStore((state) => state.getUserPosts);
  const posts = usePostsStore((state) => state.posts);
  const isPostsLoading = usePostsStore((state) => state.isPostsLoading);
  const isPostsError = usePostsStore((state) => state.isPostsError);

  const { userNickname } = useParams();

  const effectRun = useRef(false);

  useEffect(() => {
    if (!effectRun.current && typeof userNickname === "string") {
      const user = getUser({
        by: "nickname",
        data: typeof userNickname === "string" ? userNickname : "",
        return_type: "IAuthorFull",
      });
      if (user) {
        getUserPosts(user.uid);
      }
      return () => {
        effectRun.current = true;
      };
    }
  }, [getUser, getUserPosts, userNickname]);
  return (
    <>
      {isUserLoading ? (
        isUserError ? (
          <ErrorComponent />
        ) : (
          <LoaderComponent />
        )
      ) : (
        <div className="container container__profile">
          <UserBio
            userData={userData as IAuthorFull | null}
            authorizedUserData={authorizedUserData as IAuthorFull}
            postsLength={posts.length}
          />
          {isPostsLoading ? (
            isPostsError ? (
              <ErrorComponent />
            ) : (
              <LoaderComponent />
            )
          ) : posts.length === 0 ? (
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
              {posts.map((post, index) => (
                <ProfilePagePost key={index} post={post} />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ProfilePage;
