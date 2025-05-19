import { db, storage } from "../firebase";
import {
  addDoc,
  collection,
  doc,
  increment,
  serverTimestamp,
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
  IPostMedia,
} from "@/shared/types/api.types";

export const Comment: TFirebaseAddComments = async ({ comment }) => {
  const seconds = new Date().getSeconds();
  const commentRef = await addDoc(collection(db, "comments"), {
    ...comment,
    created_at: serverTimestamp(),
  });
  await updateDoc(doc(db, "posts", comment.post_uid), {
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
  const snapshot = await addDoc(collection(db, "likes"), {
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
  await updateDoc(doc(db, "posts", post_uid), {
    "likes.length": increment(1),
    post_weight: increment(1),
  });

  return like;
};

export const Media: TFirebaseAddMedia = async (files) => {
  const imagesRef = ref(storage, "images");
  const media_response: IPostMedia[] = [];
  files.forEach(async (obj) => {
    const storageRef = ref(imagesRef, obj.file_name);
    const bytes = await obj.file.bytes();

    const uploadTask = uploadBytesResumable(storageRef, bytes, {
      contentType: obj.file.type,
    });

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            // console.log("Upload is paused");
            break;
          case "running":
            // console.log("Upload is running");
            break;
        }
      },
      (error) => {
        // Handle unsuccessful uploads
        console.error("Error: ", error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          console.log("downloadURL", downloadURL);
          media_response.push({
            type: "image",
            uid: obj.file_name.split(".")[0],
            url: downloadURL,
          });
        });
      },
    );
    // if (uploadedImages.length === filesLength) {
    //   set({ isUploadedImages: true });
    // }
  });
  return media_response;
};

export const Post: TFirebaseAddPost = async ({ post }) => {
  console.log("add Post", post);
  const seconds = new Date().getSeconds();
  const postRef = await addDoc(collection(db, "posts"), {
    ...post,
    created_at: serverTimestamp(),
  });
  console.log("postRef", postRef);

  return {
    ...post,
    uid: postRef.id,
    created_at: { seconds, nanoseconds: 0 },
  };
};
