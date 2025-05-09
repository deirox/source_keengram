// import axios from "axios";
// import { IPost, IUser } from "@/shared/types/api.types";
import { create } from "zustand";
// import { API_ENDPOINT } from "../../api/Api";

// const uploadedUsers = useUserStore.getState().uploadedUsers;

interface IAppStore {
  s: boolean;
  // uploadedUsers: IUser[];
}

export const useAppStore = create<IAppStore>(() => ({
  s: false,
  // posts: [],
}));
