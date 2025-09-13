import { useCallback } from 'react';
import { usePostsStore } from '../stores/postsStore';
import { useMessageStore } from '../stores/messageStore';
import { useAuthStore } from '../stores/authStore';
import { postsAPI, authAPI } from '../lib/api';
import { uploadImageUtils, uploadVideoUtils, fileToUint8Array, compressImage, generateVideoThumbnail } from '../lib/uploadUtils';
import { UPLOAD_PROGRESS_STAGE, UPLOAD_VIDEO_PROGRESS_STAGE } from '../lib/uploadUtils';

export const usePosts = () => {
  const {
    postMoment,
    isLoading,
    progressUpload,
    setPostMoment,
    setLoading,
    setProgressUpload,
    clearPostMoment,
  } = usePostsStore();

  const { setMessage } = useMessageStore();
  const { user } = useAuthStore();

  const uploadImage = useCallback(async (file: File, caption: string, recipients: string[] = []) => {
    if (!user) {
      setMessage({
        message: 'User not authenticated',
        type: 'Error',
      });
      return;
    }

    try {
      setLoading(true);
      
      // Processing image
      setMessage({
        message: UPLOAD_PROGRESS_STAGE.PROCESSING_IMAGE,
        type: 'info',
        hideButton: true,
        progress: 0,
      });

      const compressedFile = await compressImage(file);
      const imageBlob = await fileToUint8Array(compressedFile);
      const fileSize = imageBlob.byteLength;
      const nameImg = `${Date.now()}_vtd182.jpg`;

      // Initiating upload
      setMessage({
        message: UPLOAD_PROGRESS_STAGE.INITIATING_UPLOAD,
        type: 'info',
        hideButton: true,
        progress: 24,
      });

      const uploadUrl = await uploadImageUtils.initiateUpload(
        user.localId,
        user.idToken,
        fileSize,
        nameImg
      );

      // Uploading image
      setMessage({
        message: UPLOAD_PROGRESS_STAGE.UPLOADING,
        type: 'info',
        hideButton: true,
        progress: 42,
      });

      await uploadImageUtils.uploadImage(uploadUrl, imageBlob, user.idToken);

      // Getting download URL
      setMessage({
        message: UPLOAD_PROGRESS_STAGE.FETCHING_DOWNLOAD_URL,
        type: 'info',
        hideButton: true,
        progress: 66,
      });

      const downloadUrl = await uploadImageUtils.getDownloadUrl(
        user.localId,
        user.idToken,
        nameImg
      );

      // Creating moment
      setMessage({
        message: UPLOAD_PROGRESS_STAGE.CREATING_MOMENT,
        type: 'info',
        hideButton: true,
        progress: 80,
      });

      const response = await postsAPI.postMoment(
        {
          caption,
          thumbnail_url: downloadUrl,
          recipients,
        },
        user.idToken
      );

      setMessage({
        message: UPLOAD_PROGRESS_STAGE.COMPLETED,
        type: 'info',
        hideButton: true,
        progress: 100,
      });

      setPostMoment('Post Moment completed');
      return response;
    } catch (error: any) {
      // Try to refresh token and retry
      try {
        const refresh = await authAPI.getAccessToken(user.refreshToken);
        // Update token in store
        // Retry upload logic here if needed
      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
      }

      setMessage({
        message: `Error: ${error?.response?.data?.error?.message || error.message}`,
        type: 'Error',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, setMessage, setPostMoment]);

  const uploadVideo = useCallback(async (file: File, caption: string, recipients: string[] = []) => {
    if (!user) {
      setMessage({
        message: 'User not authenticated',
        type: 'Error',
      });
      return;
    }

    try {
      setLoading(true);

      // Processing video
      setMessage({
        message: UPLOAD_VIDEO_PROGRESS_STAGE.PROCESSING,
        type: 'info',
        hideButton: true,
        progress: 0,
      });

      const videoBlob = await fileToUint8Array(file);
      const fileSize = videoBlob.byteLength;
      const nameVideo = `${Date.now()}_vtd182.mp4`;

      // Initiating upload
      setMessage({
        message: UPLOAD_VIDEO_PROGRESS_STAGE.INITIATING_UPLOAD,
        type: 'info',
        hideButton: true,
        progress: 10,
      });

      const uploadUrl = await uploadVideoUtils.initiateUploadVideo(
        user.localId,
        user.idToken,
        fileSize,
        nameVideo
      );

      // Uploading video
      setMessage({
        message: UPLOAD_VIDEO_PROGRESS_STAGE.UPLOADING,
        type: 'info',
        hideButton: true,
        progress: 26,
      });

      await uploadVideoUtils.uploadVideo(uploadUrl, videoBlob, user.idToken);

      // Getting download URL
      setMessage({
        message: UPLOAD_VIDEO_PROGRESS_STAGE.FETCHING_DOWNLOAD_URL,
        type: 'info',
        hideButton: true,
        progress: 48,
      });

      const downloadVideoUrl = await uploadVideoUtils.getDownloadVideoUrl(
        user.localId,
        user.idToken,
        nameVideo
      );

      // Uploading thumbnail
      setMessage({
        message: UPLOAD_VIDEO_PROGRESS_STAGE.UPLOADING_THUMBNAIL,
        type: 'info',
        hideButton: true,
        progress: 60,
      });

      const thumbnailDataUrl = await generateVideoThumbnail(file);
      const thumbnailBlob = await fetch(thumbnailDataUrl).then(r => r.blob());
      const thumbnailArray = new Uint8Array(await thumbnailBlob.arrayBuffer());
      const thumbnailName = `${Date.now()}_thumbnail.jpg`;
      
      const thumbnailUploadUrl = await uploadImageUtils.initiateUpload(
        user.localId,
        user.idToken,
        thumbnailArray.byteLength,
        thumbnailName
      );
      
      await uploadImageUtils.uploadImage(thumbnailUploadUrl, thumbnailArray, user.idToken);
      const thumbnailUrl = await uploadImageUtils.getDownloadUrl(
        user.localId,
        user.idToken,
        thumbnailName
      );

      // Creating moment
      setMessage({
        message: UPLOAD_VIDEO_PROGRESS_STAGE.CREATING_MOMENT,
        type: 'info',
        hideButton: true,
        progress: 88,
      });

      const response = await postsAPI.postMoment(
        {
          caption,
          thumbnail_url: thumbnailUrl,
          video_url: downloadVideoUrl,
          recipients,
        },
        user.idToken
      );

      setMessage({
        message: UPLOAD_PROGRESS_STAGE.COMPLETED,
        type: 'info',
        hideButton: true,
        progress: 100,
      });

      setPostMoment('Post Moment completed');
      return response;
    } catch (error: any) {
      setMessage({
        message: `Error: ${error?.response?.data?.error?.message || error.message}`,
        type: 'Error',
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, setMessage, setPostMoment]);

  return {
    postMoment,
    isLoading,
    progressUpload,
    uploadImage,
    uploadVideo,
    clearPostMoment,
  };
};
