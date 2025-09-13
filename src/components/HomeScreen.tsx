"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFriends } from "@/hooks/useFriends";
import { usePosts } from "@/hooks/usePosts";
import { useMessageStore } from "@/stores/messageStore";

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
  const { message, clearMessage } = useMessageStore();

  const [selectedMedia, setSelectedMedia] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [isVideo, setIsVideo] = useState(false);
  const [showFriendSelector, setShowFriendSelector] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      getFriends(user.localId, user.idToken);
    }
  }, [user, getFriends]);

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

  const handleRemoveMedia = () => {
    setSelectedMedia(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePost = async () => {
    if (!selectedMedia || !user) return;

    try {
      if (isVideo) {
        await uploadVideo(selectedMedia, caption, selected);
      } else {
        await uploadImage(selectedMedia, caption, selected);
      }
    } catch (error) {
      console.error("Post error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-red-900">
      {/* Header */}
      <header className="bg-white/10 backdrop-blur-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm">🔒</span>
              </div>
              <h1 className="text-xl font-bold text-white">Locket</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-white/70 text-sm">
                Welcome, {userInfo?.displayName || user?.email || "User"}
              </div>
              <button
                onClick={handleLogout}
                disabled={isLoading}
                className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {isLoading ? "Signing out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Message Display */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl border ${
              message.type === "Error"
                ? "bg-red-500/20 border-red-500/50 text-red-200"
                : message.type === "Success"
                ? "bg-green-500/20 border-green-500/50 text-green-200"
                : "bg-blue-500/20 border-blue-500/50 text-blue-200"
            }`}
          >
            <div className="flex justify-between items-center">
              <span>{message.message}</span>
              {message.progress !== undefined && (
                <div className="ml-4">
                  <div className="w-32 bg-white/20 rounded-full h-2">
                    <div
                      className="bg-white h-2 rounded-full transition-all duration-300"
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
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
          <h2 className="text-white font-semibold text-xl mb-6">
            Create a Post
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
                className="border-2 border-dashed border-white/30 rounded-xl p-8 text-center cursor-pointer hover:border-white/50 transition-colors"
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
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Friend Selection */}
          <div className="mb-6">
            <button
              onClick={() => setShowFriendSelector(!showFriendSelector)}
              className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors duration-200"
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
                          ? "bg-pink-500 text-white"
                          : "bg-white/10 text-white/70 hover:bg-white/20"
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
          </div>

          {/* Post Button */}
          <button
            onClick={handlePost}
            disabled={!selectedMedia || isLoading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading
              ? "Posting..."
              : `Send to ${
                  selected.length > 0 ? selected.length : "all"
                } friends`}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mr-4">
                {userInfo?.photoUrl ? (
                  <img
                    src={userInfo.photoUrl}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-2xl">👤</span>
                )}
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  Your Profile
                </h3>
                <p className="text-white/70 text-sm">
                  {userInfo?.displayName || user?.email || "User"}
                </p>
              </div>
            </div>
            <p className="text-white/60 text-sm">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Friends Card */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">👥</span>
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
          </div>

          {/* Firebase Demo Card */}
          <div className="md:col-span-2 lg:col-span-3 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-full flex items-center justify-center mr-4">
                <span className="text-2xl">🔥</span>
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">
                  Firebase Demo
                </h3>
                <p className="text-white/70 text-sm">
                  Check console for Firebase logs
                </p>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-white/60 text-sm">
                This app uses Firebase Authentication with anonymous sign-in.
                Check your browser's developer console to see the Firebase
                request headers being logged.
              </p>
              <div className="bg-black/20 rounded-lg p-3 text-green-400 text-xs font-mono">
                <div>
                  🔥 Request URL: https://identitytoolkit.googleapis.com/...
                </div>
                <div>🔥 Headers: {"{"}</div>
                <div>&nbsp;&nbsp;"Content-Type": "application/json",</div>
                <div>&nbsp;&nbsp;"X-Client-Version": "Web/12.2.1",</div>
                <div>
                  &nbsp;&nbsp;"X-Firebase-GMPID":
                  "1:940478761197:web:d58fbeb2eb2bf2cf7fe4e4",
                </div>
                <div>&nbsp;&nbsp;"X-Firebase-Client": "H4sIAAAAA...",</div>
                <div>{"}"}</div>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="md:col-span-2 lg:col-span-3 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h3 className="text-white font-semibold text-lg mb-4">
              Recent Activity
            </h3>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-white/5 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white">🎉</span>
                </div>
                <div>
                  <p className="text-white font-medium">Welcome to Locket!</p>
                  <p className="text-white/60 text-sm">
                    You've successfully joined the app
                  </p>
                </div>
              </div>
              <div className="flex items-center p-4 bg-white/5 rounded-xl">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white">📱</span>
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

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/20 transition-colors duration-200">
            <div className="text-center">
              <div className="text-2xl mb-2">📷</div>
              <p className="text-white text-sm font-medium">Add Photo</p>
            </div>
          </button>
          <button className="bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/20 transition-colors duration-200">
            <div className="text-center">
              <div className="text-2xl mb-2">👤</div>
              <p className="text-white text-sm font-medium">Add Friend</p>
            </div>
          </button>
          <button className="bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/20 transition-colors duration-200">
            <div className="text-center">
              <div className="text-2xl mb-2">⚙️</div>
              <p className="text-white text-sm font-medium">Settings</p>
            </div>
          </button>
          <button className="bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl p-4 border border-white/20 transition-colors duration-200">
            <div className="text-center">
              <div className="text-2xl mb-2">💬</div>
              <p className="text-white text-sm font-medium">Messages</p>
            </div>
          </button>
        </div>
      </main>
    </div>
  );
};

export default HomeScreen;
