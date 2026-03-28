import { create } from 'zustand';

export const useStore = create((set) => ({
  isLoaded: false,
  progress: 0,
  setLoaded: (status) => set({ isLoaded: status }),
  setProgress: (p) => set({ progress: p }),
}));