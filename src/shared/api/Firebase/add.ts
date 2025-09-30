import { firestore, storage } from "../firebase";
import {
  addDoc,
  collection,
  doc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";
import {
  TFirebaseAddComments,
  TFirebaseAddLike,
  TFirebaseAddMedia,
  TFirebaseAddPost,
} from "./add.types";
import {
  initialIFirebaseCreatedAt,
  IPostLike,
  IMedia,
  initialIBigDataWithLength,
  IBigDataWithLength,
  IPostComment,
} from "@/shared/types/api.types";

export const Comment: TFirebaseAddComments = async ({ comment }) => {
  const seconds = new Date().getSeconds();
  const commentRef = await addDoc(collection(firestore, "posts", comment.post_uid, "comments"), {
    ...comment,
    created_at: serverTimestamp(),
  });
  await updateDoc(doc(firestore, "posts", comment.post_uid), {
    "comments.length": increment(1),
    post_weight: increment(1),
  });

  return {
    ...comment,
    uid: commentRef.id,
    created_at: { seconds, nanoseconds: 0 },
  };
};

export const Like: TFirebaseAddLike = async ({ post_uid, user_uid }) => {
  const snapshot = await addDoc(collection(firestore, "likes"), {
    user_uid,
    post_uid,
    created_at: serverTimestamp(),
  });
  const like: IPostLike = {
    uid: snapshot.id,
    post_uid,
    user_uid,
    created_at: initialIFirebaseCreatedAt,
  };
  await updateDoc(doc(firestore, "posts", post_uid), {
    "likes.length": increment(1),
    post_weight: increment(1),
  });

  return like;
};

export const Media: TFirebaseAddMedia = async (files) => {
  const success: IMedia[] = [];
  try {
    files.forEach(async (_file) => {
      const storageRef = ref(storage, _file.path);
      const bytes = await _file.file.bytes();

      const uploadTask = uploadBytesResumable(storageRef, bytes, {
        contentType: _file.file.type,
      });

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // const progress =
          //   (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          switch (snapshot.state) {
            case "paused":
              // console.log("Upload is paused");
              break;
            case "running":
              // console.log("Upload is running");
              break;
          }
        },
        (_error) => {
          // Handle unsuccessful uploads
          throw _error
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log("downloadURL", downloadURL);
            success.push({
              path: _file.path,
              type: "image",
              uid: _file.file_name.split(".")[0],
              url: [downloadURL],
            });
          });
        },
      );
    });
    return {
      status: 'success',
      data: success,
    }
  } catch (_error) {
    return { status: 'error', data: null, error: _error }
  }
};

export const Post: TFirebaseAddPost = async ({ post }) => {
  try {
    const postRef = doc(collection(firestore, "posts"));
    await setDoc(postRef, {
      ...post,
      comments: { ...initialIBigDataWithLength, length: post.comments.length },
      created_at: serverTimestamp(),
    })
    let new_comments: IBigDataWithLength<IPostComment[]> = { data: [], length: post.comments.length }
    if (post.comments.data.length > 0) {
      const { author, comment_id, text } = post.comments.data[0]
      const commentRef = await addDoc(collection(firestore, "posts", postRef.id, "comments"), {
        author,
        comment_id,
        text,
        post_uid: postRef.id,
        created_at: serverTimestamp(),
      })
      new_comments.data = [{ ...post.comments.data[0], uid: commentRef.id }]
    }
    await updateDoc(doc(firestore, "users", post.author as string, "meta", "info"), { posts: { length: increment(1) } })
    return {
      status: 'success',
      data: {
        ...post,
        comments: new_comments,
        uid: postRef.id,
        created_at: { ...initialIFirebaseCreatedAt, nanoseconds: Date.now() },
      }
    }
  } catch (error) {
    return { status: 'error', data: null, error: error }
  }
};
