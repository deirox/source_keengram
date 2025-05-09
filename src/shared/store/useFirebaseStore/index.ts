// import axios from "axios";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { create } from "zustand";
import { storage } from "@/shared/api/firebase";
import utils from "../../utils";

// import { API_ENDPOINT } from "../../api/Api";

interface IFirebaseStore {
  isUploadedImages: boolean;
  isDeletedImages: boolean;
  uploadedImages: any[];
  deletedImages: any[];
  uploadImages: (files: any, filesLength: number) => void;
  deleteImages: () => void;
}

export const useFirebaseStore = create<IFirebaseStore>((set, get) => ({
  isUploadedImages: true,
  isDeletedImages: true,
  uploadedImages: [],
  deletedImages: [],
  uploadImages: async (files, filesLength) => {
    // @ts-ignore
    set({ uploadedImages: [], isUploadImages: false });
    const uploadedImages = get().uploadedImages;
    files.forEach(async (file: any) => {
      //   console.log(file.name);
      // const fileName = file.name;
      const fileName = utils.makeid(20);
      const storageRef = ref(storage, `images/${fileName}`);

      const uploadTask = uploadBytesResumable(storageRef, file);

      await uploadTask.on(
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
          console.log("Error: ", error);
        },
        () => {
          // Handle successful uploads on complete
          // For instance, get the download URL: https://firebasestorage.googleapis.com/...
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            // downloadURLs = [...downloadURLs, { url: downloadURL }];
            set((state) => ({
              uploadedImages: [
                ...state.uploadedImages,
                { name: fileName, url: downloadURL },
              ],
            }));
            // console.log("File ", fileName, " available at: ", downloadURL);
          });
        },
      );
      if (uploadedImages.length === filesLength) {
        set({ isUploadedImages: true });
      }
    });
  },
  deleteImages: () => {
    // Create a reference to the file to delete
    const uploadedImages = get().uploadedImages;
    const files = uploadedImages;
    const deletedImages = get().deletedImages;

    files.forEach(async (file) => {
      const fileRef = ref(storage, `images/${file.name}`);
      // Delete the file
      deleteObject(fileRef)
        .then(() => {
          // File deleted successfully
          set((state) => ({
            deletedImages: [...state.deletedImages, { name: file.name }],
          }));
          // console.log("File is deleted: ", file.name);
        })
        .catch((error) => {
          console.log("On delete error");
          console.error("Error: ", error);
          // Uh-oh, an error occurred!
        });
      if (deletedImages.length === files.length) {
        set({ uploadedImages: [], deletedImages: [], isUploadedImages: true });
      }
    });
  },
}));
