import { doc, runTransaction } from "firebase/firestore";
import { create } from "zustand";
// import { API_ENDPOINT } from "../../api/Api";
import { db } from "@/shared/api/firebase";
// import { useAppStore } from "@/shared/store/useAppStore";
import APIFirebase, { IFirebaseGetUserArgs } from "@/shared/api/Firebase/index";
import {
  IAuthorFull,
  IAuthorizedUser,
  initialIAuthor,
  TUserInterfaces,
} from "@/shared/types/api.types";

// const URL = "/users";
// const uploadedUsers = useAppStore.getState().uploadedUsers;

export interface IGetUserArgs extends IFirebaseGetUserArgs {
  isAuthorized?: boolean;
}

interface IUserStore {
  userData: TUserInterfaces | null;
  uploadedUsers: TUserInterfaces[];
  authorizedUserData: TUserInterfaces | null;
  isUserLoading: boolean;
  isAuthorizedUserLoading: boolean;
  isUserError: boolean;
  isAuthorizedUserError: boolean;
  isMutateUserLoading: boolean;
  isMutateUserError: boolean;
  isSignedOut: boolean;
  setIsSignedOut: (bool: boolean) => void;
  setAuthorizedUserLoading: (bool: boolean) => void;
  mutateUserData: ({
    userUid,
    username,
    nickname,
    description,
  }: {
    userUid: string;
    username: string;
    nickname: string;
    description: string;
  }) => void;
  setAuthorizedUser: (user: TUserInterfaces | null) => void;
  getUser: (args: IGetUserArgs) => TUserInterfaces | null;
  setAvatar: (userUid: string, newAvatarUrl: string) => void;
}

export const useUserStore = create<IUserStore>((set, get) => ({
  userData: initialIAuthor,
  uploadedUsers: [],
  authorizedUserData: initialIAuthor,
  isUserLoading: true,
  isAuthorizedUserLoading: true,
  isUserError: false,
  isAuthorizedUserError: false,
  isMutateUserLoading: false,
  isMutateUserError: false,
  isSignedOut: true,
  setIsSignedOut: (bool) => {
    set({ isSignedOut: bool });
  },
  setAuthorizedUserLoading: (bool) => {
    set({ isAuthorizedUserLoading: bool });
  },
  mutateUserData: async ({ userUid, username, nickname, description }) => {
    set({
      isMutateUserLoading: true,
      isMutateUserError: false,
    });

    try {
      const userRef = doc(db, "users", userUid);
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw "Document does not exist!";
        }
        transaction.update(userRef, {
          username: username,
          nickname: nickname,
          description: description,
        });
      });
      set((state) => ({
        isMutateUserLoading: false,
        authorizedUserData: {
          ...state.authorizedUserData,
          username,
          nickname,
          description,
        } as unknown as IAuthorizedUser,
      }));
    } catch (e: unknown) {
      // This will be a "population is too big" error.
      console.error(e);
      set({
        isMutateUserLoading: false,
        isMutateUserError: !!e,
      });
    }
  },
  setAuthorizedUser: (user) => {
    const authorizedUserData = get().authorizedUserData;
    if (user !== null) {
      const {
        uid = "",
        accessToken = "",
        email = "",
      } = user as IAuthorizedUser;
      set({
        authorizedUserData: {
          ...authorizedUserData,
          uid,
          accessToken,
          email,
          isAuth: !!email,
        } as IAuthorizedUser,
      });
    } else {
      set({
        authorizedUserData: {
          ...authorizedUserData,
          uid: "",
          accessToken: "",
          email: "",
          isAuth: false,
        } as IAuthorizedUser,
      });
    }
  },
  getUser: (args) => {
    const { isAuthorized = false } = args;
    const authorizedUserData = get().authorizedUserData;

    const uploadedUsers = get().uploadedUsers;
    //Check state of availability of current user data
    const filteredUser = uploadedUsers.filter((user) => {
      switch (args.by) {
        case "uid":
          return user.uid === args.data;
        case "nickname":
          return user.nickname === args.data;
      }
    });
    if (filteredUser.length > 0) {
      //If state not available of current user data
      return filteredUser[0];

      // const request = getUser({ ...args, return_type, isAuthorized });
    }

    let response: TUserInterfaces | null = null;
    switch (isAuthorized) {
      case true:
        set({
          isAuthorizedUserLoading: true,
        });
        APIFirebase.get
          .User({
            by: "uid",
            data: args.data,
            return_type: "IAuthorizedUser",
          })
          .then((res) => {
            if (res.status === "success") {
              response = { ...res.data } as IAuthorizedUser;
              return set({
                authorizedUserData: {
                  ...authorizedUserData,
                  ...res.data,
                } as IAuthorizedUser,
                userData: res.data,
              });
            }
            if (res.status === "error") {
              return set({
                isAuthorizedUserError: true,
              });
            }
          })
          .finally(() =>
            set({
              isAuthorizedUserLoading: false,
              isUserLoading: false,
            }),
          );
        break;
      case false:
        set({ isUserLoading: true });
        APIFirebase.get
          .User(args)
          .then((res) => {
            if (res.status === "success") {
              response = { ...res.data } as IAuthorFull;
              return set({
                userData: res.data,
              });
            }
            if (res.status === "error") {
              return set({
                userData: null,
                isUserError: true,
              });
            }
          })
          .finally(() =>
            set({
              isAuthorizedUserLoading: false,
              isUserLoading: false,
            }),
          );
        break;
    }

    return response;
  },
  setAvatar: async (userUid, newAvatarUrl) => {
    try {
      const userRef = doc(db, "users", userUid);
      await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw "Document does not exist!";
        }
        // const newAvatar = userDoc.data().population + 1;
        transaction.update(userRef, { avatar: { url: newAvatarUrl } });
      });
      set((state) => ({
        authorizedUserData: {
          ...state.authorizedUserData,
          avatar: {
            url: newAvatarUrl,
          },
        } as IAuthorizedUser,
      }));
    } catch (e) {
      // This will be a "population is too big" error.
      console.error(e);
    }
  },
}));
