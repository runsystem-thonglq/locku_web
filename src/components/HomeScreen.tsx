"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFriends } from "@/hooks/useFriends";
import { usePosts } from "@/hooks/usePosts";
import { useMessageStore } from "@/stores/messageStore";
import axios from "axios";
import { UPLOAD_PROGRESS_STAGE } from "@/lib/uploadUtils";
import { authAPI } from "@/lib/api";

const HomeScreen: React.FC = () => {
  const { user, userInfo, logout, isLoading } = useAuth();
  const {
    friends,
    selected,
    getFriends,
    toggleFriendSelection,
    clearSelectedFriends,
  } = useFriends();
  const { uploadImage, uploadVideo, postMoment, clearPostMoment } = usePosts();
  const { message, clearMessage, setMessage } = useMessageStore();

  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [isVideo, setIsVideo] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showFriendSelector, setShowFriendSelector] = useState(false);
  const [serverStatus, setServerStatus] = useState<
    "checking" | "online" | "offline"
  >("checking");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      getFriends(user.localId, user.idToken);
    }
  }, [user, getFriends]);

  const checkServerStatus = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/health`);
      if (res.status === 200) {
        setServerStatus("online");
      } else {
        setServerStatus("offline");
      }
    } catch (e) {
      setServerStatus("offline");
    }
  };
  useEffect(() => {
    checkServerStatus();
  }, []);

  useEffect(() => {
    if (postMoment) {
      clearPostMoment();
      setSelectedMedia(null);
      setCaption("");
      clearSelectedFriends();
    }
  }, [postMoment, clearPostMoment, clearSelectedFriends]);

  const handleLogout = async () => {
    try {
      logout();
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedMedia(file);
      setIsVideo(file.type.startsWith("video/"));
    }
  };

  const uploadMedia = async (file: File, caption: string, user: any) => {
    let timeOutId;
    try {
      // const user = JSON.parse(miscFuncs.getCookie("user"));
      const formData = new FormData();

      if (file.type.includes("image")) {
        formData.append("images", file);
      } else if (file.type.includes("video")) {
        formData.append("videos", file);
      }

      formData.append("caption", caption);
      formData.append("userId", user.localId);
      formData.append("idToken", user.idToken);

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_API}/locket/upload-media`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      clearTimeout(timeOutId);
      return res.data;
    } catch (error) {
      clearTimeout(timeOutId);
      throw error;
    }
  };

  const handleRemoveMedia = () => {
    setSelectedMedia(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePost = async () => {
    if (!selectedMedia || !user) return;

    try {
      setIsPosting(true);
      await uploadMedia(selectedMedia, caption, user);
      // if (isVideo) {
      //   // await postVideo(
      //   //   user.localId,
      //   //   user.idToken,
      //   //   selectedMedia as any,
      //   //   caption
      //   // );
      //   await uploadVideo(selectedMedia, caption, selected);
      // } else {
      //   await uploadImage(selectedMedia, caption, selected);
      // }
      setMessage({
        message: UPLOAD_PROGRESS_STAGE.COMPLETED,
        type: "info",
        hideButton: true,
      });
      clearPostMoment();
      setSelectedMedia(null);
      setCaption("");
      clearSelectedFriends();
    } catch (error: any) {
      console.error("Post error:", error);
      setMessage({
        message: UPLOAD_PROGRESS_STAGE.FAILED,
        type: "Error",
        hideButton: true,
      });
    } finally {
      setIsPosting(false);
    }
  };

  const getMMO = async () => {
    try {
      const { userId, token } = await authAPI.getMoment(user?.idToken || "");
      console.log(userId, 22);
      const userA = await authAPI.fetchUser(userId || "", user?.idToken || "");
      const a = await authAPI.getMoment(user?.idToken || "", [userId]);
    } catch (error) {}
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-neutral-900/90 backdrop-blur-lg border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-[50px] h-[50px] bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-black text-sm rounded-full">
                  <img src="/dogdog.gif" alt="" />
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4 ">
              <div
                className={`px-2 py-1 rounded-full text-xs border ${
                  serverStatus === "online"
                    ? "bg-green-500/20 border-green-500/50 text-green-200"
                    : serverStatus === "offline"
                    ? "bg-red-500/20 border-red-500/50 text-red-200"
                    : "bg-white/10 border-white/20 text-white/70"
                }`}
                title="Server status"
              >
                {serverStatus === "checking"
                  ? "Checking server..."
                  : serverStatus === "online"
                  ? "Server online"
                  : "Server offline"}
              </div>
              <div className="text-white/70 text-sm">
                {userInfo?.displayName || user?.email || "User"}
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-2 py-1 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {isLoading ? "Signing out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-4">
          {/* Profile Card */}
          <div className="bg-neutral-900 rounded-2xl px-6 py-2 border border-white/10">
            <div className="flex items-center w-full">
              <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mr-4">
                {userInfo?.photoUrl ? (
                  <img
                    src={userInfo.photoUrl}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-black">👤</span>
                )}
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  {userInfo?.displayName || user?.email || "User"}
                </h3>
                <p className="text-white/70 text-sm"></p>
              </div>
            </div>
            {/* <p className="text-white/60 text-sm">
              Manage your account settings and preferences
            </p> */}
          </div>
        </div>
        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border ${
              message.type === "Error"
                ? "bg-red-500/20 border-red-500/50 text-red-200"
                : message.type === "Success"
                ? "bg-green-500/20 border-green-500/50 text-green-200"
                : "bg-yellow-500/20 border-yellow-500/50 text-yellow-200"
            }`}
          >
            <div className="flex justify-between items-center">
              <span>{message.message}</span>
              {message.progress !== undefined && (
                <div className="ml-4">
                  <div className="w-32 bg-white/20 rounded-full h-2">
                    <div
                      className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${message.progress}%` }}
                    />
                  </div>
                </div>
              )}
              <button
                onClick={clearMessage}
                className="ml-4 text-white/70 hover:text-white"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Post Creation Section */}
        <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10 mb-20">
          <h2 className="text-white font-semibold text-xl mb-6">
            {/* <img src="/dogdog.gif" alt="z" /> */}
          </h2>

          {/* Media Upload */}
          <div className="mb-6">
            {selectedMedia ? (
              <div className="relative">
                {isVideo ? (
                  <video
                    src={URL.createObjectURL(selectedMedia)}
                    controls
                    className="w-full max-w-md h-64 object-cover rounded-xl"
                  />
                ) : (
                  <img
                    src={URL.createObjectURL(selectedMedia)}
                    alt="Selected"
                    className="w-full max-w-md h-64 object-cover rounded-xl"
                  />
                )}
                <button
                  onClick={handleRemoveMedia}
                  className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center cursor-pointer hover:border-white/40 transition-colors"
              >
                <div className="text-4xl mb-2">📷</div>
                <p className="text-white/70">Click to select image or video</p>
                <p className="text-white/50 text-sm">Supports JPG, PNG, MP4</p>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Caption Input */}
          <div className="mb-6">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption..."
              className="w-full px-4 py-3 bg-neutral-800 border border-white/10 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Friend Selection */}
          {/* <div className="mb-6">
            <button
              onClick={() => setShowFriendSelector(!showFriendSelector)}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-4 py-2 rounded-lg transition-colors duration-200"
            >
              Select Friends ({selected.length} selected)
            </button>

            {showFriendSelector && (
              <div className="mt-4 p-4 bg-white/5 rounded-xl">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {friends.map((friend) => (
                    <button
                      key={friend.uid}
                      onClick={() => toggleFriendSelection(friend.uid)}
                      className={`p-2 rounded-lg text-sm transition-colors ${
                        selected.includes(friend.uid)
                          ? "bg-yellow-500 text-black"
                          : "bg-neutral-800 text-white/80 hover:bg-neutral-700"
                      }`}
                    >
                      {friend.first_name} {friend.last_name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowFriendSelector(false)}
                  className="mt-2 text-white/70 hover:text-white text-sm"
                >
                  Done
                </button>
              </div>
            )}
          </div> */}

          {/* Post Button */}
          <div className="flex items-center justify-center  fixed bottom-0 left-0 bg-black w-full py-15">
            <button
              onClick={handlePost}
              disabled={!selectedMedia || isPosting}
              className="block flex items-center justify-center w-[65px] h-[65px] mx-auto bg-yellow-500 text-black py-3 rounded-full font-semibold hover:bg-yellow-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* {isPosting
              ? "Posting..."
              : `Send to ${
                  selected.length > 0 ? selected.length : "all"
                } friends`} */}
              <span className="w-[55px] h-[55px] bg-white inline-block rounded-full "></span>
            </button>
          </div>
        </div>
        {/* Friends Card */}
        {/* <div className="bg-neutral-900 rounded-2xl px-6 py-2 border border-white/10">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mr-4">
              <span className="text-2xl text-black">👥</span>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Friends</h3>
              <p className="text-white/70 text-sm">
                {friends.length} connections
              </p>
            </div>
          </div>
          <p className="text-white/60 text-sm">
            Connect with your closest friends
          </p>
        </div> */}

        {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="md:col-span-2 lg:col-span-3 bg-neutral-900 rounded-2xl p-6 border border-white/10">
            <h3 className="text-white font-semibold text-lg mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-neutral-800 rounded-xl">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-black">🎉</span>
                </div>
                <div>
                  <p className="text-white font-medium">Welcome to Locket!</p>
                  <p className="text-white/60 text-sm">
                    You've successfully joined the app
                  </p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-neutral-800 rounded-xl">
                <div className="w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-black">📱</span>
                </div>
                <div>
                  <p className="text-white font-medium">Get Started</p>
                  <p className="text-white/60 text-sm">
                    Add friends and start sharing memories
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-neutral-900 hover:bg-neutral-800 rounded-xl p-4 border border-white/10 transition-colors duration-200">
            <div className="text-center">
              <div className="text-2xl mb-2">📷</div>
              <p className="text-white text-sm font-medium">Add Photo</p>
            </div>
          </button>
          <button className="bg-neutral-900 hover:bg-neutral-800 rounded-xl p-4 border border-white/10 transition-colors duration-200">
            <div className="text-center">
              <div className="text-2xl mb-2">👤</div>
              <p className="text-white text-sm font-medium">Add Friend</p>
            </div>
          </button>
          <button className="bg-neutral-900 hover:bg-neutral-800 rounded-xl p-4 border border-white/10 transition-colors duration-200">
            <div className="text-center">
              <div className="text-2xl mb-2">⚙️</div>
              <p className="text-white text-sm font-medium">Settings</p>
            </div>
          </button>
          <button className="bg-neutral-900 hover:bg-neutral-800 rounded-xl p-4 border border-white/10 transition-colors duration-200">
            <div className="text-center">
              <div className="text-2xl mb-2">💬</div>
              <p className="text-white text-sm font-medium">Messages</p>
            </div>
          </button>
        </div> */}
      </main>
    </div>
  );
};

export default HomeScreen;
