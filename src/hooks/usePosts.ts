import { useCallback } from "react";
import { usePostsStore } from "../stores/postsStore";
import { useMessageStore } from "../stores/messageStore";
import { useAuthStore } from "../stores/authStore";
import {
  postsAPI,
  authAPI,
  cretateBody,
  LOCKET_API_BASE_URL,
} from "../lib/api";
import {
  uploadImageUtils,
  uploadVideoUtils,
  fileToUint8Array,
  compressImage,
  generateVideoThumbnail,
} from "../lib/uploadUtils";
import {
  UPLOAD_PROGRESS_STAGE,
  UPLOAD_VIDEO_PROGRESS_STAGE,
} from "../lib/uploadUtils";
import CryptoJS from "crypto";

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
  const getMd5Hash = (str: string) => {
    return CryptoJS.createHash("md5").update(str).digest("hex");
  };
  const postVideoToLocket = async (
    idToken: string,
    videoUrl: string,
    thumbnailUrl: string,
    caption: string
  ) => {
    try {
      const postHeaders = {
        "content-type": "application/json",
        authorization: `Bearer ${idToken}`,
      };

      const data = {
        data: {
          thumbnail_url: thumbnailUrl,
          video_url: videoUrl,
          md5: getMd5Hash(videoUrl),
          analytics: {
            experiments: {
              flag_4: {
                "@type": "type.googleapis.com/google.protobuf.Int64Value",
                value: "43",
              },
              flag_10: {
                "@type": "type.googleapis.com/google.protobuf.Int64Value",
                value: "505",
              },
              flag_23: {
                "@type": "type.googleapis.com/google.protobuf.Int64Value",
                value: "400",
              },
              flag_22: {
                "@type": "type.googleapis.com/google.protobuf.Int64Value",
                value: "1203",
              },
              flag_19: {
                "@type": "type.googleapis.com/google.protobuf.Int64Value",
                value: "52",
              },
              flag_18: {
                "@type": "type.googleapis.com/google.protobuf.Int64Value",
                value: "1203",
              },
              flag_16: {
                "@type": "type.googleapis.com/google.protobuf.Int64Value",
                value: "303",
              },
              flag_15: {
                "@type": "type.googleapis.com/google.protobuf.Int64Value",
                value: "501",
              },
              flag_14: {
                "@type": "type.googleapis.com/google.protobuf.Int64Value",
                value: "500",
              },
              flag_25: {
                "@type": "type.googleapis.com/google.protobuf.Int64Value",
                value: "23",
              },
            },
            amplitude: {
              device_id: "BF5D1FD7-9E4D-4F8B-AB68-B89ED20398A6",
              session_id: {
                value: "1722437166613",
                "@type": "type.googleapis.com/google.protobuf.Int64Value",
              },
            },
            google_analytics: {
              app_instance_id: "5BDC04DA16FF4B0C9CA14FFB9C502900",
            },
            platform: "ios",
          },
          sent_to_all: true,
          caption: caption,
          overlays: [
            {
              data: {
                text: caption,
                text_color: "#FFFFFFE6",
                type: "standard",
                max_lines: {
                  "@type": "type.googleapis.com/google.protobuf.Int64Value",
                  value: "4",
                },
                background: {
                  material_blur: "ultra_thin",
                  colors: [],
                },
              },
              alt_text: caption,
              overlay_id: "caption:standard",
              overlay_type: "caption",
            },
          ],
        },
      };

      const response = await fetch(`${LOCKET_API_BASE_URL}/postMomentV2`, {
        method: "POST",
        headers: postHeaders,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Failed to create post: ${response.statusText}`);
      }
    } catch (error: any) {
      throw error;
    }
  };
  const uploadImage = useCallback(
    async (file: File, caption: string, recipients: string[] = []) => {
      if (!user) {
        setMessage({
          message: "User not authenticated",
          type: "Error",
        });
        return;
      }

      try {
        setLoading(true);

        // Processing image
        setMessage({
          message: UPLOAD_PROGRESS_STAGE.PROCESSING_IMAGE,
          type: "info",
          hideButton: true,
          progress: 0,
        });

        const compressedFile = await compressImage(file);
        const imageBlob = await fileToUint8Array(compressedFile);
        const fileSize = imageBlob.byteLength;
        const nameImg = `${Date.now()}_moment.jpg`;

        // Initiating upload
        setMessage({
          message: UPLOAD_PROGRESS_STAGE.INITIATING_UPLOAD,
          type: "info",
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
          type: "info",
          hideButton: true,
          progress: 42,
        });

        await uploadImageUtils.uploadImage(uploadUrl, imageBlob, user.idToken);

        // Getting download URL
        setMessage({
          message: UPLOAD_PROGRESS_STAGE.FETCHING_DOWNLOAD_URL,
          type: "info",
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
          type: "info",
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
          type: "info",
          hideButton: true,
          progress: 100,
        });

        setPostMoment("Post Moment completed");
        return response;
      } catch (error: any) {
        // Try to refresh token and retry
        try {
          const refresh = await authAPI.getAccessToken(user.refreshToken);
          // Update token in store
          // Retry upload logic here if needed
        } catch (refreshError) {
          console.error("Token refresh failed:", refreshError);
        }

        // alert();
        setMessage({
          message: `Error: ${
            error?.response?.data?.error?.message || error.message
          }`,
          type: "Error",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user, setLoading, setMessage, setPostMoment]
  );

  const uploadVideo = useCallback(
    async (file: File, caption: string, recipients: string[] = []) => {
      if (!user) {
        setMessage({
          message: "User not authenticated",
          type: "Error",
        });
        return;
      }

      try {
        setLoading(true);

        // Processing video
        setMessage({
          message: UPLOAD_VIDEO_PROGRESS_STAGE.PROCESSING,
          type: "info",
          hideButton: true,
          progress: 0,
        });

        const videoBlob = await fileToUint8Array(file);
        const fileSize = videoBlob.byteLength;
        const nameVideo = `${Date.now()}_moment.mp4`;

        // Initiating upload
        setMessage({
          message: UPLOAD_VIDEO_PROGRESS_STAGE.INITIATING_UPLOAD,
          type: "info",
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
          type: "info",
          hideButton: true,
          progress: 26,
        });

        await uploadVideoUtils.uploadVideo(uploadUrl, videoBlob, user.idToken);

        // Getting download URL
        setMessage({
          message: UPLOAD_VIDEO_PROGRESS_STAGE.FETCHING_DOWNLOAD_URL,
          type: "info",
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
          type: "info",
          hideButton: true,
          progress: 60,
        });

        const thumbnailDataUrl = await generateVideoThumbnail(file);
        const thumbnailBlob = await fetch(thumbnailDataUrl).then((r) =>
          r.blob()
        );
        const thumbnailArray = new Uint8Array(
          await thumbnailBlob.arrayBuffer()
        );
        const thumbnailName = `${Date.now()}_thumbnail.jpg`;

        const thumbnailUploadUrl = await uploadImageUtils.initiateUpload(
          user.localId,
          user.idToken,
          thumbnailArray.byteLength,
          thumbnailName
        );

        await uploadImageUtils.uploadImage(
          thumbnailUploadUrl,
          thumbnailArray,
          user.idToken
        );
        const thumbnailUrl = await uploadImageUtils.getDownloadUrl(
          user.localId,
          user.idToken,
          thumbnailName
        );

        // Creating moment
        setMessage({
          message: UPLOAD_VIDEO_PROGRESS_STAGE.CREATING_MOMENT,
          type: "info",
          hideButton: true,
          progress: 88,
        });

        const bodyPostMoment = cretateBody(
          caption,
          thumbnailUrl,
          downloadVideoUrl,
          recipients || []
        );
        console.log(bodyPostMoment);
        // const response = await postsAPI.postMoment(

        const response = await postVideoToLocket(
          user.idToken,
          downloadVideoUrl,
          thumbnailUrl,
          caption
        );
        //   JSON.stringify(bodyPostMoment.data),
        //   user.idToken
        // );

        setMessage({
          message: UPLOAD_PROGRESS_STAGE.COMPLETED,
          type: "info",
          hideButton: true,
          progress: 100,
        });

        setPostMoment("Post Moment completed");
        return response;
      } catch (error: any) {
        setMessage({
          message: `Error: ${
            error?.response?.data?.error?.message || error.message
          }`,
          type: "Error",
        });
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [user, setLoading, setMessage, setPostMoment]
  );

  return {
    postMoment,
    isLoading,
    progressUpload,
    uploadImage,
    uploadVideo,
    clearPostMoment,
  };
};
