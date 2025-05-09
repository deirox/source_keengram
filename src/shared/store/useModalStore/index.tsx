import React from "react";
import { create } from "zustand";

interface IModalStore {
  isCreatePostModalOpen: boolean;
  setIsCreatePostModalOpen: (bool: boolean) => void;
  children: React.FC;
}

export const useModalStore = create<IModalStore>((set) => ({
  isCreatePostModalOpen: false,
  setIsCreatePostModalOpen: (bool: boolean) =>
    set({ isCreatePostModalOpen: bool }),
  children: ()=> {return <></>},
  // <Component/>
}));
