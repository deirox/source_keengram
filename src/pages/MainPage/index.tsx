import { useEffect, useRef } from "react";
import InfiniteScroll from "react-infinite-scroller";
import styles from "./MainPage.module.css";

import { usePostsStore } from "@/shared/store/usePostsStore";
import PostCard from "@/components/Post";
import ErrorComponent from "@/components/ErrorComponent";
import LoaderComponent from "@/components/LoaderComponent";

const MainPage = () => {
  const effectRun = useRef(false);

  const getPosts = usePostsStore((state) => state.getPosts);
  const isPostsLoading = usePostsStore((state) => state.isPostsLoading);
  const isPostsError = usePostsStore((state) => state.isPostsError);
  const totalCount = usePostsStore((state) => state.totalCount);
  const posts = usePostsStore((state) => state.posts);

  const page = useRef(1);
  const hasMore = useRef(posts.length < totalCount);

  useEffect(() => {
    if (!effectRun.current) {
      getPosts(page.current, 5);
      return () => {
        effectRun.current = true;
      };
    }
  }, []);

  return (
    <>
      {totalCount === 0 && posts.length === 0 && isPostsLoading ? (
        isPostsError ? (
          <ErrorComponent />
        ) : (
          <LoaderComponent />
        )
      ) : (
        <div className={styles.main_page__posts}>
          {totalCount >= 0 && posts.length === 0 && !isPostsLoading ? (
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
              {isPostsLoading &&
                <LoaderComponent text="Идёт загрузка постов! Подождите!" />
              }
              <InfiniteScroll
                initialLoad={false}
                hasMore={hasMore.current}
                pageStart={page.current}
                loadMore={(_page) => {
                  if (totalCount === 0 && posts.length === 0) return
                  getPosts(_page)
                }}
              >
                {posts.map((post) => {
                  return <PostCard key={post.uid} post={post} />;
                })}
              </InfiniteScroll>
              {posts.length >= totalCount && (
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
