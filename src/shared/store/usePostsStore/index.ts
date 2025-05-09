import axios from "axios";
import { create } from "zustand";
import utils from "@/shared/utils";
import { API_ENDPOINT } from "@/shared/api/api";
import { db } from "@/shared/api/firebase";
import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  startAfter,
  where,
} from "firebase/firestore";
import { IPost } from "@/shared/types/api.types";
import { useUserStore } from "../useUserStore";

const URL = "/posts";

interface IPostStore {
  posts: IPost[];
  isPostsLoading: boolean;
  isPostsError: any;
  totalCount: number;
  isMutatePostsLoading: boolean;
  isMutatePostsError: any;
  mutateLike: (postUid: string, userUid: string, isUserPosts?: boolean) => void;
  addComment: (
    postUid: string,
    nickname: string,
    text: string,
    isUserPosts: boolean,
  ) => void;
  getUserPosts: (userUid: string, limitCount?: number) => void;
  getPosts: (page?: number, limitCount?: number) => void;
  getMorePosts: (page?: number, limitCount?: number) => void;
  sortPosts: (posts: IPost[]) => void;
  addPost: (post: IPost) => void;
}

export const usePostsStore = create<IPostStore>((set, get) => ({
  posts: [],
  isPostsLoading: true,
  isPostsError: false,
  totalCount: 0,
  isMutatePostsLoading: false,
  isMutatePostsError: false,
  mutateLike: async (postUid, userUid) => {
    // console.log(postUid, userUid);
    try {
      set({
        isMutatePostsLoading: true,
      });
      const posts = get().posts;

      const oldPost = posts.find((post) => post.uid === postUid);
      let newPost: IPost | null = null;
      // console.log("likes", likes);
      if (oldPost) {
        if (oldPost.likes.data.includes(userUid)) {
          newPost = {
            ...oldPost,
            likes: {
              data: [
                ...oldPost.likes.data.filter(
                  (like) => String(like) !== String(userUid),
                ),
              ],
              length: oldPost.likes.length,
            },
          };
        } else {
          newPost = {
            ...oldPost,
            likes: {
              data: [...oldPost.likes.data, userUid],
              length: oldPost.likes.length,
            },
          };
        }
      }
      const newPostWeighted = {
        ...newPost,
        post_weight: utils.calculatePostWeight(newPost),
      } as IPost;

      const newPosts = posts.map((post) => {
        if (post.uid === postUid) {
          return newPostWeighted;
        } else return post;
      });

      const userRef = doc(db, "posts", postUid);
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          console.warn("Произошла неизвестная ошибка!");
          return;
        }
        transaction.update(userRef, {
          likes: newPostWeighted.likes,
          post_weight: utils.calculatePostWeight(newPostWeighted),
        });
        set({
          isMutatePostsLoading: false,
          posts: [...newPosts],
        });
      });
    } catch (error) {
      set({
        isMutatePostsError: error,
      });
    }
  },
  addComment: async (postUid, nickname, text) => {
    set({
      isMutatePostsLoading: true,
    });
    try {
      set({
        isMutatePostsLoading: true,
      });
      const posts = get().posts;

      const oldPost = posts.find((post) => post.uid === postUid);
      if (!oldPost) return;

      const newComments = [
        ...oldPost.comments.data,
        {
          nickname: nickname,
          text: text,
        },
      ];
      const newPost = {
        ...oldPost,
        comments: { ...oldPost.comments, data: newComments },
      } as IPost;

      const newPostWeighted = {
        ...newPost,
        post_weight: utils.calculatePostWeight(newPost),
      };
      const newPosts = posts.map((post) => {
        if (post.uid === postUid) {
          return newPostWeighted;
        } else return post;
      });

      const userRef = doc(db, "posts", postUid);
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          console.warn("Произошла неизвестная ошибка!");
          return;
        }
        transaction.update(userRef, {
          comments: newPostWeighted.comments,
          post_weight: utils.calculatePostWeight(newPostWeighted),
        });

        set({
          isMutatePostsLoading: false,
          posts: [...newPosts],
        });
      });
    } catch (error) {
      set({
        isMutatePostsError: error,
      });
    }
  },
  getPosts: async (page = 0, limitCount = 5) => {
    set({
      posts: [],
      isPostsLoading: true,
      isPostsError: false,
    });
    console.warn("page", page);

    const getUser = useUserStore.getState().getUser;
    // const sortPosts = get().sortPosts;
    // const authorizedUserData = get().authorizedUserData;
    const postsRef = collection(db, "posts");
    let q;

    const postsNow = usePostsStore.getState().posts;
    if (postsNow.length > 0) {
      q = query(
        postsRef,
        orderBy("post_weight", "desc"),
        startAfter(postsNow[postsNow.length]),
        limit(limitCount),
      );
    } else {
      q = query(postsRef, orderBy("post_weight", "desc"), limit(limitCount));
    }

    // console.log(q);
    const querySnapshot = await getDocs(q);

    try {
      // console.log("u", uploadedUsers);
      querySnapshot.forEach(async (document) => {
        // doc.data() is never undefined for query doc snapshots
        const post = document.data();
        const authorUid = post.author;
        const user = getUser({ by: "uid", data: authorUid });
        if (user) {
          const newPost = {
            ...post,
            uid: document.id,
            author: user,
          } as IPost;
          set((state) => ({
            posts: [...state.posts, newPost],
            isPostsLoading: false,
          }));
        }
      });
    } catch (error) {
      console.warn("Произошла ошибка при получении постов!");
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
      // const posts = get().posts;
      // const sortPosts = get().sortPosts;
      // const authorizedUserData = get().authorizedUserData;
      const postsRef = collection(db, "posts");
      // console.log("userUid: ", userUid);
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
            isPostsLoading: false,
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
            console.log("Такого пользователя не существует!");
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
  addPost: async (post) => {
    if (typeof post.author !== "string") {
      const weightedPost = {
        ...post,
        author: post.author.uid,
        post_weight: utils.calculatePostWeight(post),
      };
      const weightedPostLocal = {
        ...post,
        post_weight: utils.calculatePostWeight(post),
      };

      console.log(weightedPost);
      await addDoc(collection(db, "posts"), weightedPost);
      set((state) => ({
        posts: [...state.posts, weightedPostLocal],
        userPosts: [...state.posts, weightedPostLocal],
      }));

      return { ...weightedPost };
    }
  },
}));
