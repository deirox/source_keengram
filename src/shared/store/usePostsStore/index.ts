import axios from "axios";
import { create } from "zustand";
import utils from "@/shared/utils";
import { API_ENDPOINT } from "@/shared/api/api";
import { db } from "@/shared/api/firebase";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  startAt,
  where,
} from "firebase/firestore";
import {
  IAuthor,
  IBigDataWithLength,
  initialIPostLike,
  IPost,
  IPostComment,
  TUserInterfaces,
} from "@/shared/types/api.types";
import { useUserStore } from "../useUserStore";
import APIFirebase from "@/shared/api/Firebase/index";

const URL = "/posts";

interface IPostStore {
  posts: IPost[];
  isPostsLoading: boolean;
  isPostsError: unknown;
  totalCount: number;
  isMutatePostsLoading: boolean;
  isMutatePostsError: unknown;
  mutateLike: ({
    like_uid,
    postUid,
    userUid,
    action,
    isUserPosts,
  }: {
    like_uid: string;
    postUid: string;
    userUid: string;
    action: "add" | "remove";
    isUserPosts?: boolean;
  }) => void;
  addComment: (
    post_uid: string,
    author_uid: string,
    text: string,
    isUserPosts?: boolean,
  ) => void;
  getUserPosts: (userUid: string, limitCount?: number) => void;
  getPosts: (page?: number, limitCount?: number) => void;
  getMorePosts: (page?: number, limitCount?: number) => void;
  getComments: (
    post_uid: string,
    page?: number,
    limit_count?: number,
  ) => Promise<IBigDataWithLength<IPostComment[]>>;
  sortPosts: (posts: IPost[]) => void;
  addPost: ({
    post,
    user,
  }: {
    post: IPost;
    user: TUserInterfaces;
  }) => Promise<IPost>;
}

export const usePostsStore = create<IPostStore>((set, get) => ({
  posts: [],
  isPostsLoading: true,
  isPostsError: false,
  totalCount: 0,
  addPost: async ({ post, user }) => {
    const weightedPost = {
      ...post,
      author: user.uid,
      post_weight: utils.calculatePostWeight(post),
    };

    console.log(weightedPost);
    const post_response = await APIFirebase.add.Post({ post: weightedPost });
    const weightedPostLocal = { ...post_response, author: user.uid };
    set((state) => ({
      posts: [...state.posts, weightedPostLocal],
      userPosts: [...state.posts, weightedPostLocal],
    }));

    return weightedPostLocal;
  },
  getPosts: async (page = 0, limitCount = 5) => {
    set({
      posts: [],
      isPostsLoading: true,
      isPostsError: false,
    });
    console.warn("page", page);
    try {
      const getUser = useUserStore.getState().getUser;
      // const sortPosts = get().sortPosts;
      // const authorizedUserData = get().authorizedUserData;
      const postsRef = collection(db, "posts");
      let q;

      const postsNow = get().posts;
      if (postsNow.length > 0) {
        q = query(
          postsRef,
          orderBy("post_weight", "desc"),
          startAt(page * limitCount),
          limit(limitCount),
        );
      } else {
        q = query(postsRef, orderBy("post_weight", "desc"), limit(limitCount));
      }

      // console.log(q);
      const querySnapshot = await getDocs(q);
      const authorizedUser = useUserStore.getState().authorizedUserData;
      if (!authorizedUser) return;

      querySnapshot.forEach(async (document) => {
        // doc.data() is never undefined for query doc snapshots
        const post = document.data();
        const authorUid = post.author;
        const user = getUser({ by: "uid", data: authorUid });
        if (user) {
          const comments = await usePostsStore
            .getState()
            .getComments(document.id);
          const like = await APIFirebase.get.Like({
            post_uid: document.id,
            user_uid: authorizedUser.uid,
          });
          const newPost = {
            ...post,
            uid: document.id,
            author: user,
            comments,
            likes: {
              data:
                like.data && like.data.post_uid && like.data.post_uid.length > 0
                  ? [like.data]
                  : [],
              length: post.likes.length,
            },
          } as IPost;
          set((state) => ({
            posts: [...state.posts, newPost],
            isPostsLoading: false,
          }));
        }
      });
    } catch (error) {
      console.error("Произошла ошибка при получении постов!");
      set({ posts: [], isPostsLoading: true, isPostsError: error });
    }
  },
  getMorePosts: async (page, limitCount) => {
    await axios
      .get(`${API_ENDPOINT}${URL}?_page=${page}&_limit=${limitCount}`)
      .then((response) => {
        const responseData = [...response.data];
        set((state) => ({
          posts: [...state.posts, ...responseData],
          totalCount: response.headers["x-total-count"],
          isPostsLoading: false,
        }));
      })
      .catch((error) => {
        console.warn("Произошла ошибка при получении постов!");
        set({ isPostsError: error });
      });
  },

  getUserPosts: async (userUid, limitCount = 5) => {
    set((state) => ({
      posts: state.posts.filter((post) => {
        if (post.author === userUid) {
          return post.author === userUid;
        } else if (typeof post.author !== "string") {
          return post.author.uid === userUid;
        }
      }),
      isPostsLoading: true,
      isPostsError: false,
    }));
    try {
      const getUser = useUserStore.getState().getUser;
      const postsRef = collection(db, "posts");
      const q = query(
        postsRef,
        where("author", "==", userUid),
        orderBy("created_at", "desc"),
        limit(limitCount),
      );
      // console.log(q);
      if (userUid.length > 0) {
        const querySnapshot = await getDocs(q);
        if (
          querySnapshot.forEach((doc) => {
            return doc;
          }) === undefined
        ) {
          set({
            posts: [],
            isPostsLoading: true,
            isPostsError: false,
          });
        }
        querySnapshot.forEach(async (document) => {
          // doc.data() is never undefined for query doc snapshots
          const post = document.data();
          const authorUid = post.author;

          const user = getUser({ by: "uid", data: authorUid });
          if (user) {
            // console.log("Document data:", docSnap.data());

            set((state) => ({
              posts: [
                ...state.posts,
                { ...post, uid: document.id, author: user },
              ] as IPost[],
              isPostsLoading: false,
              isPostsError: false,
            }));
          } else {
            console.error("Такого пользователя не существует!");
          }
        });
      }
    } catch (error) {
      console.error(error);
      set({ isPostsLoading: true, isPostsError: error });
    }
  },
  sortPosts: (posts) => {
    const newPosts = posts.sort((a, b) => {
      return b.post_weight - a.post_weight;
    });
    set({ posts: [...newPosts] });
  },
  isMutatePostsLoading: false,
  isMutatePostsError: false,
  mutateLike: async ({ like_uid, postUid, userUid, action }) => {
    // console.log(postUid, userUid);
    try {
      set({
        isMutatePostsLoading: true,
      });
      let like = initialIPostLike;
      if (action === "add") {
        like = await APIFirebase.add.Like({
          post_uid: postUid,
          user_uid: userUid,
        });
      }
      if (action === "remove") {
        await APIFirebase.remove.Like({
          like_uid: like_uid,
          post_uid: postUid,
        });
      }
      const posts = get().posts;

      const oldPost = posts.find((post) => post.uid === postUid);
      let newPost: IPost | null = null;
      // console.log("likes", likes);
      if (oldPost) {
        if (
          oldPost.likes.data.filter((like) => like.user_uid === userUid)
            .length > 0
        ) {
          newPost = {
            ...oldPost,
            likes: {
              data: [
                ...oldPost.likes.data.filter(
                  (like) => String(like.user_uid) !== String(userUid),
                ),
              ],
              length: oldPost.likes.length,
            },
          };
        } else {
          newPost = {
            ...oldPost,
            likes: {
              data: [...oldPost.likes.data, like],
              length: oldPost.likes.length,
            },
          };
        }
      }
      if (!newPost) return;
      const newPostWeighted = {
        ...newPost,
        post_weight: utils.calculatePostWeight(newPost),
      } as IPost;

      const newPosts = posts.map((post) => {
        if (post.uid === postUid) {
          return newPostWeighted;
        } else return post;
      });

      set({
        isMutatePostsLoading: false,
        posts: [...newPosts],
      });
    } catch (error) {
      set({
        isMutatePostsError: error,
      });
    }
  },
  addComment: async (post_uid, author_uid, text) => {
    set({
      isMutatePostsLoading: true,
    });
    try {
      set({
        isMutatePostsLoading: true,
      });
      const posts = get().posts;

      const oldPost = posts.find((post) => post.uid === post_uid);
      if (!oldPost) return;

      const newComment = await APIFirebase.add.Comment({
        comment: {
          post_uid: post_uid,
          comment_id: oldPost.comments.length,
          author: author_uid,
          text,
        },
      });

      const newCommentsData = [...oldPost.comments.data, newComment];
      const newPost = {
        ...oldPost,
        comments: {
          ...oldPost.comments,
          data: newCommentsData,
          length: newCommentsData.length,
        },
      } as IPost;

      const newPostWeighted = {
        ...newPost,
        post_weight: utils.calculatePostWeight(newPost),
      };

      const newPosts = posts.map((post) => {
        if (post.uid === post_uid) {
          return newPostWeighted;
        } else return post;
      });

      set({
        isMutatePostsLoading: false,
        posts: [...newPosts],
      });
    } catch (error) {
      set({
        isMutatePostsError: error,
      });
    }
  },
  getComments: async (post_uid) => {
    const comments_response = await APIFirebase.get.Comment({
      post_uid,
    });
    if (comments_response.data === null) return { data: [], length: 0 };

    const response = await Promise.all(
      comments_response.data.map(async (comment) => {
        const author = useUserStore.getState().getUser({
          by: "uid",
          data: comment.author as string,
        });
        return {
          ...comment,
          author: author as IAuthor,
        };
      }),
    );
    return { data: response, length: response.length };
  },
}));
