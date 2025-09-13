import { useCallback } from "react";
import { useFriendsStore } from "../stores/friendsStore";
import { useMessageStore } from "../stores/messageStore";
import { friendsAPI } from "../lib/api";

export const useFriends = () => {
  const {
    friends,
    isLoadFriends,
    selected,
    setFriends,
    setIsLoadFriend,
    setSelectedFriend,
    addSelectedFriend,
    removeSelectedFriend,
    clearSelectedFriends,
  } = useFriendsStore();

  const { setMessage } = useMessageStore();

  const getFriends = useCallback(
    async (idUser: string, idToken: string) => {
      try {
        setIsLoadFriend(true);
        // const listFriendId = await friendsAPI.getListIdFriend(idToken, idUser);
        const listFriend = await friendsAPI.getListFriend(idToken, []);

        setFriends(listFriend);
        return listFriend;
      } catch (error: any) {
        console.error("Error fetching friends:", error);
        setMessage({
          message: `Error: ${error.message}`,
          type: "Error",
        });
        throw error;
      } finally {
        setIsLoadFriend(false);
      }
    },
    [setFriends, setIsLoadFriend, setMessage]
  );

  const toggleFriendSelection = useCallback(
    (friendId: string) => {
      if (selected.includes(friendId)) {
        removeSelectedFriend(friendId);
      } else {
        addSelectedFriend(friendId);
      }
    },
    [selected, addSelectedFriend, removeSelectedFriend]
  );

  return {
    friends,
    isLoadFriends,
    selected,
    getFriends,
    setSelectedFriend,
    addSelectedFriend,
    removeSelectedFriend,
    clearSelectedFriends,
    toggleFriendSelection,
  };
};
