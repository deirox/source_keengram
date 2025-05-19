// import axios from "axios";
import { deleteObject, ref } from "firebase/storage";
import { create } from "zustand";
import { storage } from "@/shared/api/firebase";

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
    set({ uploadedImages: [], isUploadedImages: false });
    console.log("uploadImages", files, filesLength);
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
