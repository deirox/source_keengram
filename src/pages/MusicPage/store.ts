import { create } from "zustand";

interface IAudioStore {
  whatAudioPlaying: string;
}

export const useAudioStore = create<IAudioStore>(() => ({
  whatAudioPlaying: "",
}));
