import { create } from "zustand";
import utils from "@/shared/utils";
import { firestore } from "@/shared/api/firebase";
import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  orderBy,
  query,
  startAt,
  where,
} from "firebase/firestore";
import {
  IAPIMethodResponse,
  IAuthorizedUser,
  IBigDataWithLength,
  initialIPostLike,
  IPost,
  IPostComment,
  TUserInterfaces,
} from "@/shared/types/api.types";
import { useUserStore } from "../useUserStore";
import APIFirebase from "@/shared/api/Firebase/index";

// const URL = "/posts";

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
  addComment: ({ }: {
    author: IAuthorizedUser,
    post_uid: string,
    comment_id: number,
    text: string,
    isUserPosts?: boolean,
  }) => void;
  getUserPosts: (userUid: string, limitCount?: number) => void;
  getPosts: (page?: number, limitCount?: number) => void;
  getComments: (
    post_uid: string,
    page?: number,
    limit_count?: number,
  ) => Promise<IBigDataWithLength<IPostComment[]>>;
  sortPosts: (posts: IPost[]) => void;
  addPost: ({ }: {
    post: Omit<IPost, "uid">;
    user: TUserInterfaces;
  }) => Promise<IAPIMethodResponse<IPost>>;
  deletePost: ({ }: {
    post: IPost;
    user_uid: string;
  }) => Promise<boolean>;
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

    const post_response = await APIFirebase.add.Post({ post: weightedPost });

    if (post_response.status === 'success' && post_response.data !== null) {
      post_response.data.author = user
      if (post_response.data.comments.data.length > 0) {
        post_response.data.comments.data[0].author = user
      }

      set((state) => ({
        posts: [...state.posts, post_response.data as IPost],
        userPosts: [...state.posts, post_response.data as IPost],
      }));
    }

    return post_response;
  },

  deletePost: async ({ post, user_uid }) => {
    if (typeof post.author === 'string') {
      if (post.author !== user_uid) return false
    } else {
      if (post.author.uid !== user_uid) return false
    }

    const response = await APIFirebase.remove.Post({ post })
    if (!response.data) return false
    if (response.status === 'success') {
      set((state) => ({ posts: state.posts.filter(_post => _post.uid !== post.uid) }))
    }
    return response.data
  },

  getPosts: async (page = 1, limitCount = 5) => {
    set(() => {
      if (page <= 1) return {
        posts: [],
        isPostsLoading: true,
        isPostsError: false,
      }
      return {
        isPostsLoading: true,
        isPostsError: false,
      }
    });

    try {
      const getUser = useUserStore.getState().getUser;
      const postsRef = collection(firestore, "posts");

      if (page === 1) {
        const snapshot = await getCountFromServer(postsRef);
        set({ totalCount: snapshot.data().count })
      } else if (page > 1 && page * limitCount > get().totalCount) return

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
        const user = await getUser({
          by: "uid",
          data: authorUid,
        });
        if (user) {
          const comments = await usePostsStore
            .getState()
            .getComments(document.id, 0, 1);
          const like = await APIFirebase.get.Like({
            post_uid: document.id,
            user_uid: authorizedUser.uid,
          });
          const newPost = {
            ...post,
            uid: document.id,
            author: user,
            comments: { data: comments.data, length: post.comments.length },
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


  getUserPosts: async (userUid, limitCount = 5) => {
    set((state) => {
      console.log('state', state.posts)
      return {
        posts: state.posts.filter((post) => {
          if (typeof post.author === "string" && post.author === userUid) {
            return post.author === userUid;
          } else if (typeof post.author !== "string") {
            return post.author.uid === userUid;
          }
        }),
        isPostsLoading: true,
        isPostsError: false,
      }
    });
    try {
      const getUser = useUserStore.getState().getUser;
      const postsRef = collection(firestore, "posts");
      const q = query(
        postsRef,
        where("author", "==", userUid),
        orderBy("created_at", "desc"),
        limit(limitCount),
      );
      // console.log(q);
      if (userUid.length === 0) return
      if (userUid.length > 0) {
        const querySnapshot = await getDocs(q);

        set(({
          isPostsLoading: false,
          isPostsError: false,
        }));
        querySnapshot.forEach(async (document) => {
          // doc.data() is never undefined for query doc snapshots
          const post = document.data();
          const authorUid = post.author;
          const user = await getUser({ by: "uid", data: authorUid });

          if (user) {
            const filter = get().posts.filter(post => post.uid === document.id)
            if (filter.length > 0) {
              return
            }

            const newPost = { ...post, uid: document.id, author: user } as IPost;
            set((state) => ({
              posts: [
                ...state.posts,
                newPost
              ] as IPost[],
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
              length:
                action === "add"
                  ? oldPost.likes.length + 1
                  : oldPost.likes.length - 1,
            },
          };
        } else {
          newPost = {
            ...oldPost,
            likes: {
              data: [...oldPost.likes.data, like],
              length:
                action === "add"
                  ? oldPost.likes.length + 1
                  : oldPost.likes.length - 1,
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
  addComment: async ({ author, post_uid, comment_id, text }) => {
    set({
      isMutatePostsLoading: true,
    });
    try {
      set({
        isMutatePostsLoading: true,
      });

      const newComment = await APIFirebase.add.Comment({
        comment: {
          post_uid: post_uid,
          comment_id: comment_id,
          author: author.uid,
          text,
        },
      });

      set((state) => {
        const post = state.posts.find((post) => post.uid === post_uid);
        if (!post) return { isMutatePostsLoading: false }
        newComment.author = author
        post.comments.data.push(newComment)
        post.comments = {
          data: post.comments.data,
          length: post.comments.data.length,
        }
        post.post_weight = utils.calculatePostWeight(post)
        return {
          isMutatePostsLoading: false,
          posts: state.posts.map((_post) => {
            if (_post.uid === post_uid) {
              return post;
            } else return _post;
          }),
        }
      });
    } catch (error) {
      set({
        isMutatePostsError: error,
      });
    }
  },
  getComments: async (post_uid, page = 0, limit_count = 10) => {
    const comments_response = await APIFirebase.get.Comment({
      post_uid,
      page,
      limit_count
    });
    if (comments_response.status !== "success" || comments_response.data === null) return { data: [], length: 0 };
    const response = await Promise.all(
      comments_response.data.map(async (comment) => {
        if (typeof comment.author !== 'string') return comment

        const _author = await useUserStore.getState().getUser({
          by: "uid",
          data: comment.author as string,
        });

        return {
          ...comment,
          author: _author ? _author : comment.author,
        };
      }),
    );
    return { data: response, length: response.length };
  },
}));
