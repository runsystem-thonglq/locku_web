import { create } from "zustand";

export interface Friend {
  uid: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
}

interface FriendsState {
  friends: Friend[];
  isLoadFriends: boolean;
  selected: string[];

  // Actions
  setFriends: (friends: Friend[]) => void;
  setIsLoadFriend: (isLoadFriends: boolean) => void;
  setSelectedFriend: (selected: string[]) => void;
  addSelectedFriend: (friendId: string) => void;
  removeSelectedFriend: (friendId: string) => void;
  clearSelectedFriends: () => void;
}

export const useFriendsStore = create<FriendsState>((set) => ({
  friends: [],
  isLoadFriends: false,
  selected: [],

  setFriends: (friends) =>
    set({
      friends,
      isLoadFriends: true,
    }),

  setIsLoadFriend: (isLoadFriends) => set({ isLoadFriends }),

  setSelectedFriend: (selected) => set({ selected }),

  addSelectedFriend: (friendId) =>
    set((state) => ({
      selected: state.selected.includes(friendId)
        ? state.selected
        : [...state.selected, friendId],
    })),

  removeSelectedFriend: (friendId) =>
    set((state) => ({
      selected: state.selected.filter((id) => id !== friendId),
    })),

  clearSelectedFriends: () => set({ selected: [] }),
}));
