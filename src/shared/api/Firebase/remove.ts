import { deleteDoc, doc, increment, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { TFirebaseRemoveLike } from "./remove.types";

export const Like: TFirebaseRemoveLike = async ({ like_uid, post_uid }) => {
  await deleteDoc(doc(db, "likes", like_uid));
  // await addDoc(collection(db, "likes"), {
  //   user_uid,
  //   post_uid,
  // });
  await updateDoc(doc(db, "posts", post_uid), {
    "likes.length": increment(-1),
    post_weight: increment(-1),
  });

  return true;
};
