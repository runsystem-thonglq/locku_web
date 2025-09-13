import { create } from 'zustand';

interface ProgressUpload {
  state: string;
  progress: number;
}

interface PostsState {
  postMoment: string | null;
  isLoading: boolean;
  progressUpload: ProgressUpload | null;
  
  // Actions
  setPostMoment: (postMoment: string | null) => void;
  setLoading: (isLoading: boolean) => void;
  setProgressUpload: (progressUpload: ProgressUpload | null) => void;
  clearPostMoment: () => void;
}

export const usePostsStore = create<PostsState>((set) => ({
  postMoment: null,
  isLoading: false,
  progressUpload: null,

  setPostMoment: (postMoment) => set({ postMoment }),
  setLoading: (isLoading) => set({ isLoading }),
  setProgressUpload: (progressUpload) => set({ progressUpload }),
  
  clearPostMoment: () => set({ 
    postMoment: null, 
    isLoading: false 
  }),
}));
