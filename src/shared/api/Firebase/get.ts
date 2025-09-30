import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  startAt,
  where,
} from "firebase/firestore";
import { firestore } from "../firebase";
import {
  IAPIMethodResponse,
  IAuthor,
  IAuthorizedUser,
  initialAPIMethodResponse,
  initialIAuthor,
  initialIAuthorFull,
  initialIAuthorizedUser,
  initialIUser,
  IPostComment,
  IPostLike,
  TUserInterfaces,
} from "@/shared/types/api.types";
import { orderBy } from "firebase/firestore/lite";
import {
  IFirebaseGetUserArgs,
  IFirebaseGetUserMetaInfoArgs,
  TFirebaseGetComments,
  TFirebaseGetLike,
  TFirebaseGetUsers,
} from "./get.types";

async function UserMetaInfo<T extends IAuthor>({ user }: IFirebaseGetUserMetaInfoArgs<T>): Promise<T | null> {
  if (!user) return user
  const metaRef = query(collection(firestore, "users", user.uid, 'meta'));
  const metaSnap = await getDocs(metaRef);
  if (metaSnap.docs.length === 0) return user
  const filter = metaSnap.docs.filter(doc => doc.id === 'info')
  if (filter.length === 0) return user
  return { ...user, ...filter[0].data() }
}

/**
 * Returns the found user from Firebase.

 * @param by - uid or nickname of user
 * @param data - just pass selected "by" variant
 * @param return_type - name of string "usertype" equialent TS types of users
 * @returns User the in the selected return_type
 */
export async function User<UserType extends IAuthor>({
  by = "uid",
  data = "",
  return_type = "IAuthor",
}: IFirebaseGetUserArgs): Promise<IAPIMethodResponse<UserType>> {
  // @ts-nocheck
  const user_response: IAPIMethodResponse<UserType> = initialAPIMethodResponse;

  if (by === "uid") {
    const docRef = doc(firestore, "users", data);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      const user = { ...userData, uid: data } as Partial<IAuthorizedUser>;
      user_response.data = user as UserType;
    } else {
      console.error("No such document!");
      return { ...user_response, status: "error", error: "No such document!" };
    }
  }

  if (by === "nickname") {
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, where("nickname", "==", data));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.docs.length > 0) {
      querySnapshot.forEach((doc) => {
        const user = { uid: doc.id, ...doc.data() } as Partial<IAuthorizedUser>;
        user_response.data = user as UserType;
      });
    } else {
      return { ...user_response, status: "error", error: "No such document!" };
    }
  }

  switch (return_type) {
    case "IAuthor":
      user_response.data = Object.assign(initialIAuthor, user_response.data) as UserType;
      break;

    case "IAuthorFull":
      const af_u = await UserMetaInfo<UserType>({ return_type, user: user_response.data })
      user_response.data = Object.assign(
        initialIAuthorFull,
        af_u,
      );
      break;

    case "IAuthorizedUser":
      const a_u_info = await UserMetaInfo<UserType>({ return_type, user: user_response.data })
      user_response.data = Object.assign(
        initialIAuthorizedUser,
        a_u_info,
      );
      break;

    default:
      user_response.data = Object.assign(initialIUser, user_response.data) as UserType;
      break;
  }
  if (user_response.data.avatar.url.length === 0) {
    user_response.data.avatar.url = 'img/EmptyAvatar.jpg'
  }

  user_response.status = "success";
  return user_response;
};

export const Users: TFirebaseGetUsers = async ({
  count = 50,
}) => {
  const users_response: IAPIMethodResponse<TUserInterfaces[]> = initialAPIMethodResponse

  try {
    const usersRef = collection(firestore, "users");
    const q = query(usersRef, limit(count));
    const querySnapshot = await getDocs(q);
    const users: TUserInterfaces[] = [];

    for (const doc of querySnapshot.docs) {
      const userData = doc.data();

      const user = { ...userData, uid: doc.id } as IAuthor;

      if (users.filter(_u => _u.uid === user.uid).length > 0) {
        continue
      } else {
        users.push(user);
      }
    }
    users_response.data = users;
  } catch (error) {
    console.error("Ошибка получения пользователей:", error);
    users_response.status = "error";
    users_response.error = error instanceof Error ? error.message : "Unknown error";
  }

  users_response.status = "success";
  return users_response;
};

export const Comment: TFirebaseGetComments = async ({
  post_uid = "",
  page = 0,
  limit_count = 10,
}) => {
  const response: IAPIMethodResponse<IPostComment[]> = initialAPIMethodResponse

  try {
    const docRef = collection(firestore, "posts", post_uid, "comments");
    const _startAt = page * limit_count
    const q = query(
      docRef,
      where("comment_id", ">=", 0),
      orderBy("comment_id", "asc"),
      startAt(_startAt),
      limit(limit_count)
    );
    const querySnapshot = await getDocs(q);
    response.data = []
    querySnapshot.forEach((doc) => {
      const comment = { ...doc.data(), uid: doc.id } as IPostComment;
      if (response.data !== null) {
        response.data.push(comment);
      }
    });
  } catch (e) {
    console.error(e);
    response.status = "error";
    response.error = e;
  }
  return response;
};

export const Like: TFirebaseGetLike = async ({
  post_uid,
  user_uid,
  // page = 0,
  // limit_count = 10,
}) => {
  const response: IAPIMethodResponse<IPostLike> = initialAPIMethodResponse
  try {
    const docRef = collection(firestore, "likes");
    const q = query(
      docRef,
      where("post_uid", "==", post_uid),
      where("user_uid", "==", user_uid),
      limit(1),
    );
    const querySnapshot = await getDocs(q);
    if (querySnapshot.size > 0) {
      querySnapshot.forEach((snapshot) => {
        response.data = {
          ...snapshot.data(),
          uid: snapshot.id,
        } as unknown as IPostLike;
      });
    }
  } catch (e) {
    console.error(e);
    response.status = "error";
    response.error = e;
  }

  response.status = 'success'
  return response;
};