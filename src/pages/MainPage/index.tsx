import { useEffect, useRef, useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import styles from "./MainPage.module.css";

import { usePostsStore } from "@/shared/store/usePostsStore";
import PostCard from "@/components/PostCard";
import ErrorComponent from "@/components/ErrorComponent";
import LoaderComponent from "@/components/LoaderComponent";

const MainPage = () => {
  const effectRun = useRef(false);

  const posts = usePostsStore((state) => state.posts);
  const isPostsLoading = usePostsStore((state) => state.isPostsLoading);
  const isPostsError = usePostsStore((state) => state.isPostsError);
  const getPosts = usePostsStore((state) => state.getPosts);
  const getMorePosts = usePostsStore((state) => state.getMorePosts);
  const totalCount = usePostsStore((state) => state.totalCount);

  const [page] = useState(1);

  useEffect(() => {
    if (!effectRun.current) {
      getPosts(page, 5);
      return () => {
        effectRun.current = true;
      };
    }
  }, []);
  // console.log("posts: ", posts);

  return (
    <>
      {posts.length > 0 && isPostsLoading ? (
        isPostsError ? (
          <ErrorComponent />
        ) : (
          <LoaderComponent />
        )
      ) : (
        <div className={styles.main_page__posts}>
          {posts.length === 0 ? (
            <p
              style={{
                margin: "1rem 0",
                textAlign: "center",
                color: "rgb(var(--ig-secondary-text))",
              }}
            >
              Вы посмотрели все посты, возвращайтесь в следующий раз!
            </p>
          ) : (
            <>
              <InfiniteScroll
                hasMore={posts.length < totalCount}
                loadMore={() => {
                  // setPage(page + 1);
                  getMorePosts(page, 5);
                }}
              >
                {posts.map((post, index) => {
                  return <PostCard key={index} {...post} />;
                })}
              </InfiniteScroll>
              {posts.length > totalCount && (
                <p
                  style={{
                    margin: "1rem 0 3rem",
                    textAlign: "center",
                    color: "rgb(var(--ig-secondary-text))",
                  }}
                >
                  Вы посмотрели все посты, возвращайтесь в следующий раз!
                </p>
              )}
            </>
          )}
        </div>
      )}
    </>
  );
};

export default MainPage;
