import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import {
  IAPIMethodResponse,
  IAuthorizedUser,
  initialAPIMethodResponse,
  initialIAuthor,
  initialIAuthorFull,
  initialIAuthorizedUser,
  initialIPostLike,
  initialIUser,
  IPostComment,
  IPostLike,
  TUserInterfaces,
} from "@/shared/types/api.types";
import { useUserStore } from "@/shared/store/useUserStore";
import { orderBy } from "firebase/firestore/lite";
import {
  TFirebaseGetComments,
  TFirebaseGetLike,
  TFirebaseGetUser,
} from "./get.types";

/**
 * Returns the average of two numbers.

 * @param by -
 * @param data -
 * @param return_type -
 * @returns data that pass type return_type
 */
export const User: TFirebaseGetUser = async ({
  by = "uid",
  data = "",
  return_type = "IAuthor",
}) => {
  // @ts-expect-error
  // @ts-nocheck
  const user_response: IAPIMethodResponse<TUserInterfaces> =
    initialAPIMethodResponse;
  const uploadedUsers = useUserStore.getState().uploadedUsers;

  if (by === "uid") {
    const docRef = doc(db, "users", data);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      // console.log("Document:", docSnap);
      // console.log("Don cument data:", docSnap.data());

      const userData = docSnap.data() as Omit<IAuthorizedUser, "uid">;

      const user: IAuthorizedUser = { ...userData, uid: data };

      //Save Authorized User Data to useAppStore

      user_response.data = user;
      //Save Authorized Data to special variable
      // set({
      //   isAuthorizedUserLoading: false,
      //   authorizedUserData: { ...authorizedUserData, ...user },
      // });
    } else {
      console.error("No such document!");
      return { ...user_response, status: "error", error: "No such document!" };
    }
  }
  if (by === "nickname") {
    const usersRef = collection(db, "users");

    const q = query(usersRef, where("nickname", "==", data));
    const querySnapshot = await getDocs(q);
    // console.log(querySnapshot.docs)
    if (querySnapshot.docs.length > 0) {
      querySnapshot.forEach((doc) => {
        const user = { uid: doc.id, ...doc.data() } as IAuthorizedUser;
        user_response.data = user;
      });
    } else {
      return { ...user_response, status: "error", error: "No such document!" };
    }
  }
  useUserStore.setState({
    uploadedUsers: [
      ...uploadedUsers,
      Object.assign(initialIAuthor, user_response.data),
    ],
  });
  switch (return_type) {
    case "IAuthor":
      user_response.data = Object.assign(initialIAuthor, user_response.data);
      break;
    case "IAuthorFull":
      user_response.data = Object.assign(
        initialIAuthorFull,
        user_response.data,
      );
      break;
    case "IAuthorizedUser":
      user_response.data = Object.assign(
        initialIAuthorizedUser,
        user_response.data,
      );
      break;
    default:
      user_response.data = Object.assign(initialIUser, user_response.data);
      break;
  }

  user_response.status = "success";
  return user_response;
};

export const Comment: TFirebaseGetComments = async ({
  post_uid = "",
  // page = 0,
  // limit_count = 10,
}) => {
  const comment_response: IAPIMethodResponse<IPostComment[]> = {
    ...initialAPIMethodResponse,
    data: [],
  };
  try {
    const docRef = collection(db, "comments");
    const q = query(
      docRef,
      where("post_uid", "==", post_uid),
      orderBy("comment_id", "asc"),
      limit(10),
    );
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (doc) => {
      const comment = { ...doc.data(), uid: doc.id } as IPostComment;
      comment_response.data?.push(comment);
    });
  } catch (e) {
    console.error(e);
    comment_response.status = "error";
    comment_response.error = e;
  }
  return comment_response;
};

export const Like: TFirebaseGetLike = async ({
  post_uid,
  user_uid,
  // page = 0,
  // limit_count = 10,
}) => {
  const like_response: IAPIMethodResponse<IPostLike> = {
    ...initialAPIMethodResponse,
    data: initialIPostLike,
  };
  try {
    const docRef = collection(db, "likes");
    const q = query(
      docRef,
      where("post_uid", "==", post_uid),
      where("user_uid", "==", user_uid),
      limit(1),
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.size > 0) {
      querySnapshot.forEach((snapshot) => {
        like_response.data = {
          ...snapshot.data(),
          uid: snapshot.id,
        } as unknown as IPostLike;
      });
    }
  } catch (e) {
    console.error(e);
    like_response.status = "error";
    like_response.error = e;
  }
  return like_response;
};
