import { deleteDoc, doc, increment, updateDoc } from "firebase/firestore";
import { firestore, storage } from "../firebase";
import { TFirebaseRemoveComment, TFirebaseRemoveLike, TFirebaseRemoveMedia, TFirebaseRemovePost } from "./remove.types";
import { deleteObject, ref } from "firebase/storage";
import { IAPIMethodResponse, initialAPIMethodResponse } from "@/shared/types/api.types";

export const Like: TFirebaseRemoveLike = async ({ like_uid, post_uid }) => {
  await deleteDoc(doc(firestore, "likes", like_uid));
  // await addDoc(collection(firestore, "likes"), {
  //   user_uid,
  //   post_uid,
  // });
  await updateDoc(doc(firestore, "posts", post_uid), {
    "likes.length": increment(-1),
    post_weight: increment(-1),
  });

  return true;
};

export const Comment: TFirebaseRemoveComment = async ({ comment_uid, post_uid }) => {
  await deleteDoc(doc(firestore, "posts", post_uid, "comments", comment_uid));
  // await addDoc(collection(firestore, "likes"), {
  //   user_uid,
  //   post_uid,
  // });
  await updateDoc(doc(firestore, "posts", post_uid), {
    "comments.length": increment(-1),
    post_weight: increment(-1),
  });

  return true;
};

export const Media: TFirebaseRemoveMedia = async ({ media }) => {
  let response: IAPIMethodResponse<string[]> = initialAPIMethodResponse
  response.data = []
  try {
    media.forEach((_media) => {
      const mediaRef = ref(storage, _media.path);

      deleteObject(mediaRef).then(() => {
        // File deleted successfully
        if (!Array.isArray(response.data)) response.data = [_media.uid]
        response.data.push(_media.uid)
      })
    })
  } catch (error) {
    response.status = "error"
    response.error = error
    console.error(error)
  }
  response.status = 'success'
  return response
};

export const Post: TFirebaseRemovePost = async ({ post }) => {
  if (!post.uid || post.uid.trim().length === 0) return {
    status: 'error',
    data: null,
    error: 'Произошла ошибка при удалении поста!'
  }
  try {
    await Media({ media: post.media })

    await deleteDoc(doc(firestore, "posts", post.uid));
    if (post.comments.length > 0) {
      await deleteDoc(doc(firestore, "posts", post.uid, "comments"));
    }
    return {
      status: 'success',
      data: true,
    }
  } catch (error) {
    console.error(error)
    return {
      status: 'error',
      data: null,
      error
    }
  }
};