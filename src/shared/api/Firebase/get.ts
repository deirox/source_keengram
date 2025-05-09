import {
  collection,
  doc,
  getDoc,
  getDocs,
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
  initialIUser,
  TUserInterfaces,
  TUserTypes,
} from "@/shared/types/api.types";
import { useUserStore } from "@/shared/store/useUserStore";

export interface IFirebaseGetUserArgs {
  by: "uid" | "nickname";
  data: string;
  return_type?: TUserTypes;
}

export type TFirebaseGetUser = (
  args: IFirebaseGetUserArgs,
) => Promise<IAPIMethodResponse<TUserInterfaces>>;

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
  const response: IAPIMethodResponse<TUserInterfaces> =
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

      response.data = user;
      //Save Authorized Data to special variable
      // set({
      //   isAuthorizedUserLoading: false,
      //   authorizedUserData: { ...authorizedUserData, ...user },
      // });
    } else {
      console.error("No such document!");
      return { ...response, status: "error", error: "No such document!" };
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
        response.data = user;
      });
    } else {
      return { ...response, status: "error", error: "No such document!" };
    }
  }
  useUserStore.setState({
    uploadedUsers: [
      ...uploadedUsers,
      Object.assign(initialIAuthor, response.data),
    ],
  });
  switch (return_type) {
    case "IAuthor":
      response.data = Object.assign(initialIAuthor, response.data);
      break;
    case "IAuthorFull":
      response.data = Object.assign(initialIAuthorFull, response.data);
      break;
    case "IAuthorizedUser":
      response.data = Object.assign(initialIAuthorizedUser, response.data);
      break;
    default:
      response.data = Object.assign(initialIUser, response.data);
      break;
  }

  response.status = "success";
  return response;
};
