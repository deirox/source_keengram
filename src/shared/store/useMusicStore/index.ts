import { collection, getDocs } from "firebase/firestore";
import { create } from "zustand";
import { firestore } from "@/shared/api/firebase";
import utils from "../../utils";
import { useUserStore } from "../useUserStore";
import APIYandexDisk from "@/shared/api/YandexDisk";
import { IAudio } from "@/shared/types/api.types";

interface IMusicStore {
  allAudios: IAudio[];
  userAudios: IAudio[];
  uploadedAudios: IAudio[];
  isGetAudiosError: boolean;
  isGetAudiosLoading: boolean;
  isAudioUploading: boolean;
  isAudioUploadingError: unknown;
  getAudios: (userUid: string) => void;
  uploadAudio: (
    files: ArrayBuffer,
    fileData: {
      artist: string;
      title: string;
      img_url?: string;
    },
  ) => void;
}
export const useMusicStore = create<IMusicStore>((set, get) => ({
  allAudios: [],
  userAudios: [],
  uploadedAudios: [],
  isGetAudiosLoading: true,
  isGetAudiosError: false,
  isAudioUploading: true,
  isAudioUploadingError: false,
  getAudios: async () => {
    const querySnapshot = await getDocs(collection(firestore, `audios`));

    const f: IAudio[] = [];
    try {
      querySnapshot.forEach(async (doc) => {
        const audio = doc.data();

        f.push({ ...audio, uid: doc.id } as IAudio);
      });
      set({
        isGetAudiosLoading: false,
      });
    } catch (error) {
      console.error("Произошла ошибка серверов Яндекс Диск");
      console.error(error);
      set({
        isGetAudiosLoading: false,
        isGetAudiosError: true,
      });
    }
    try {
      // const newaudio = async (audio: IAudio) => {
      //   const audioFile = await APIYandexDisk.get.File(audio.path);
      //   return {
      //     ...audio,
      //     url: audioFile.url,
      //     public_url: audioFile.public_url,
      //     mime_type: audioFile.mime_type,
      //   };
      // };
      // f = await Promise.all(
      //   f.map((audio) => {
      //     return newaudio(audio);
      //   }),
      // );
    } catch (e) {
      console.error(e);
    }
    if (f.length > 0) {
      set(() => ({
        allAudios: f,
      }));
    }
  },
  uploadAudio: async (file, fileData) => {
    set(() => ({
      uploadedAudios: [],
      isAudioUploading: true,
      isAudioUploadingError: false,
    }));

    const uid = utils.makeid(20);
    const path = `keengram/Music/${uid}.mp3`;
    const res = await APIYandexDisk.add.File(path);

    const authorizedUserData = useUserStore.getState().authorizedUserData;
    const allAudios = get().allAudios;

    console.log(file);
    if (res && res.file) {
      const data = {
        artist: fileData.artist,
        author: authorizedUserData?.uid,
        img_url: fileData.img_url,
        order: 0,
        path,
        title: fileData.title,
      };
      const audioFile = await APIYandexDisk.add.File(path);
      set(() => ({
        isAudioUploading: false,
        allAudios: [
          ...allAudios,
          { ...data, url: audioFile?.file },
        ] as IAudio[],
        uploadedAudios: [
          { ...data, url: audioFile?.file, uid },
        ] as unknown as IAudio[],
      }));
    }
    return uid;
  },
}));
