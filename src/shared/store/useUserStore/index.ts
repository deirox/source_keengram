import { doc, runTransaction } from "firebase/firestore";
import { create } from "zustand";
import { firestore } from "@/shared/api/firebase";
import APIFirebase from "@/shared/api/Firebase/index";
import {
  IAuthor,
  IAuthorFull,
  IAuthorizedUser,
  TUserInterfaces,
} from "@/shared/types/api.types";
import { IFirebaseGetUserArgs } from "@/shared/api/Firebase/get.types";

export interface IGetUserArgs extends IFirebaseGetUserArgs {
  isAuthorized?: boolean;
}

interface IUserStore {
  userData: TUserInterfaces | null;
  uploadedUsers: TUserInterfaces[];
  authorizedUserData: IAuthorizedUser | null;
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
    name,
    surname,
    nickname,
    description,
  }: {
    userUid: string;
    name: string;
    surname: string,
    nickname: string;
    description: string;
  }) => void;
  setAuthorizedUser: (user: TUserInterfaces | null) => void;
  getUser: <UserType extends IAuthor>(args: IGetUserArgs) => Promise<UserType | null>;
  setAvatar: (userUid: string, newAvatarUrl: string) => void;
}

export const useUserStore = create<IUserStore>((set, get) => ({
  userData: null,
  uploadedUsers: [],
  authorizedUserData: null,
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
  mutateUserData: async ({ userUid, name, surname, nickname, description }) => {
    set({
      isMutateUserLoading: true,
      isMutateUserError: false,
    });

    try {
      const userRef = doc(firestore, "users", userUid);
      await runTransaction(firestore, async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists()) {
          throw "Document does not exist!";
        }
        transaction.update(userRef, {
          name: name,
          surname: surname,
          nickname: nickname,
          description: description,
        });
      });
      set((state) => ({
        isMutateUserLoading: false,
        authorizedUserData: {
          ...state.authorizedUserData,
          name,
          surname,
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
  getUser: async <UserType extends IAuthor>(args: IGetUserArgs) => {

    const { isAuthorized = false } = args;
    const authorizedUserData = get().authorizedUserData;
    const uploadedUsers = get().uploadedUsers;
    // Check state of availability of current user data
    const filteredUser = uploadedUsers.filter((user) => {
      switch (args.by) {
        case "uid":
          return user.uid === args.data;
        case "nickname":
          return user.nickname === args.data;
      }
    });
    if (filteredUser.length > 0) {
      set({
        isUserError: false,
      });
      //If state not available of current user data
      const filtered_user_type = filteredUser[0].type
      switch (args.return_type) {
        case "IAuthorizedUser":
          if (filtered_user_type === 'IAuthorizedUser') return filteredUser[0] as UserType
          break
        case "IAuthorFull":
          if (filtered_user_type === 'IAuthorFull' || filtered_user_type === 'IAuthorizedUser') return filteredUser[0] as UserType
          break
        case "IAuthor":
          return filteredUser[0] as UserType
        default:
          break
      }
    }
    let response: TUserInterfaces | null = null;
    switch (isAuthorized) {
      case true:
        set({
          isAuthorizedUserLoading: true,
        });
        await APIFirebase.get
          .User<UserType>({
            by: "uid",
            data: args.data,
            return_type: "IAuthorizedUser",
          })
          .then((res) => {
            if (res.status === "success") {
              response = { ...res.data } as TUserInterfaces;
              return set({
                authorizedUserData: {
                  ...authorizedUserData,
                  ...res.data,
                } as IAuthorizedUser,
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
        await APIFirebase.get
          .User<UserType>(args)
          .then((res) => {
            if (res.status === "success") {
              response = { ...res.data } as IAuthorFull;
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

    if (response !== null) {
      set((state) => {
        if (response !== null) {
          const filteredPrevUploadedUsers = state.uploadedUsers.filter(user => user.uid === response?.uid)

          if (filteredPrevUploadedUsers.length > 0) {

            // const newUploadedUsers
            return {
              uploadedUsers: state.uploadedUsers.map(user => {
                if (user.uid === response?.uid) {
                  return response
                }
                else return user
              }) as TUserInterfaces[],
            }
          } else {
            return {
              uploadedUsers: [...state.uploadedUsers, response]
            }
          }
        } else {
          return ({})
        }
      });
    }

    return response;
  },
  setAvatar: async (userUid, newAvatarUrl) => {
    try {
      const userRef = doc(firestore, "users", userUid);
      await runTransaction(firestore, async (transaction) => {
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
