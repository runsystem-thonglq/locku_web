import axios from "axios";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

export const UPLOAD_PROGRESS_STAGE = {
  PROCESSING_IMAGE: "Processing image",
  INITIATING_UPLOAD: "Initiating upload",
  UPLOADING: "Uploading image",
  FETCHING_DOWNLOAD_URL: "Fetching download URL",
  CREATING_MOMENT: "Creating moment",
  COMPLETED: "Upload completed",
  FAILED: "Upload failed",
};

export const UPLOAD_VIDEO_PROGRESS_STAGE = {
  PROCESSING: "Processing video",
  INITIATING_UPLOAD: "Initiating upload",
  UPLOADING: "Uploading video",
  UPLOADING_THUMBNAIL: "Uploading video thumbnail",
  FETCHING_DOWNLOAD_URL: "Fetching download URL",
  CREATING_MOMENT: "Creating moment",
  COMPLETED: "Upload completed",
  FAILED: "Upload failed",
};

// Convert File to Uint8Array
export const fileToUint8Array = async (file: File): Promise<Uint8Array> => {
  const arrayBuffer = await file.arrayBuffer();
  return new Uint8Array(arrayBuffer);
};

// Image upload functions
export const uploadImageUtils = {
  initiateUpload: async (
    idUser: string,
    idToken: string,
    fileSize: number,
    nameImg: string
  ): Promise<string> => {
    const startUrl = `https://firebasestorage.googleapis.com/v0/b/locket-img/o/users%2F${idUser}%2Fmoments%2Fthumbnails%2F${nameImg}?uploadType=resumable&name=users%2F${idUser}%2Fmoments%2Fthumbnails%2F${nameImg}`;

    const startHeaders = {
      "content-type": "application/json; charset=UTF-8",
      authorization: `Bearer ${idToken}`,
      "x-goog-upload-protocol": "resumable",
      accept: "*/*",
      "x-goog-upload-command": "start",
      // "x-goog-upload-content-length": fileSize,
      "accept-language": "vi-VN,vi;q=0.9",
      "x-firebase-storage-version": "ios/10.13.0",
      "user-agent":
        "com.locket.Locket/1.43.1 iPhone/17.3 hw/iPhone15_3 (GTMSUF/1)",
      // "x-goog-upload-content-type": "image/webp",
      "x-firebase-gmpid": "1:641029076083:ios:cc8eb46290d69b234fa609",
    };

    const startData = JSON.stringify({
      name: `users/${idUser}/moments/thumbnails/${nameImg}`,
      contentType: "image/*",
      bucket: "",
      metadata: { creator: idUser, visibility: "private" },
    });

    const response = await axios.post(startUrl, startData, {
      headers: startHeaders,
      validateStatus: (status) => status < 500,
    });

    if (response.status >= 400) {
      throw new Error(`Error: ${response?.statusText}`);
    }

    return response.headers["x-goog-upload-url"];
  },

  uploadImage: async (
    uploadUrl: string,
    blobImage: Uint8Array,
    token: string
  ) => {
    const uploadHeaders = {
      "content-type": "image/webp",
      "x-goog-upload-offset": "0",
      "x-goog-upload-command": "upload, finalize",
    };

    const response = await axios.put(uploadUrl, blobImage, {
      headers: {
        ...uploadHeaders,
        Authorization: "Firebase " + token,
      },
    });
    return response.data;
  },

  getDownloadUrl: async (
    idUser: string,
    idToken: string,
    nameImg: string
  ): Promise<string> => {
    const getUrl = `https://firebasestorage.googleapis.com/v0/b/locket-img/o/users%2F${idUser}%2Fmoments%2Fthumbnails%2F${nameImg}`;

    const getHeaders = {
      "content-type": "application/json; charset=UTF-8",
      authorization: `Bearer ${idToken}`,
    };

    const response = await axios.get(getUrl, {
      headers: getHeaders,
    });

    if (response.status >= 400) {
      throw new Error(`Error: Get failed - ${response?.data}`);
    }

    const downloadToken = response.data.downloadTokens;
    return `${getUrl}?alt=media&token=${downloadToken}`;
  },
};

// Video upload functions
export const uploadVideoUtils = {
  initiateUploadVideo: async (
    idUser: string,
    idToken: string,
    fileSize: number,
    nameVideo: string
  ) => {
    const url = `https://firebasestorage.googleapis.com/v0/b/locket-video/o/users%2F${idUser}%2Fmoments%2Fvideos%2F${nameVideo}?uploadType=resumable&name=users%2F${idUser}%2Fmoments%2Fvideos%2F${nameVideo}`;

    const headers = {
      "content-type": "application/json; charset=UTF-8",
      authorization: `Bearer ${idToken}`,
      "x-goog-upload-protocol": "resumable",
      accept: "*/*",
      "x-goog-upload-command": "start",
      // "x-goog-upload-content-length": fileSize,
      "accept-language": "vi-VN,vi;q=0.9",
      "x-firebase-storage-version": "ios/10.13.0",
      "user-agent":
        "com.locket.Locket/1.43.1 iPhone/17.3 hw/iPhone15_3 (GTMSUF/1)",
      // "x-goog-upload-content-type": "video/mp4",
      "x-firebase-gmpid": "1:641029076083:ios:cc8eb46290d69b234fa609",
    };

    const body = {
      name: `users/${idUser}/moments/videos/${nameVideo}`,
      contentType: "video/mp4",
      bucket: "",
      metadata: { creator: idUser, visibility: "private" },
    };

    const response = await axios.post(url, body, {
      headers: headers,
    });

    return response.headers["x-goog-upload-url"];
  },

  uploadVideo: async (
    uploadUrl: string,
    blobVideo: Uint8Array,
    token: string
  ) => {
    // const uploadHeaders = {
    //   "content-type": "video/mp4",
    //   "x-goog-upload-offset": "0",
    //   "x-goog-upload-command": "upload, finalize",
    // };

    const uploadHeaders = {
      "Content-Type": "application/octet-stream",
      "X-Goog-Upload-Command": "upload, finalize",
      "X-Goog-Upload-Offset": "0",
      "Upload-Incomplete": "?0",
      "Upload-Draft-Interop-Version": "3",
      "User-Agent":
        "com.locket.Locket/1.43.1 iPhone/18.1 hw/iPhone15_3 (GTMSUF/1)",
    };

    const response = await axios.put(uploadUrl, blobVideo, {
      headers: uploadHeaders,
    });

    return response.data;
  },

  getDownloadVideoUrl: async (
    idUser: string,
    idToken: string,
    nameVideo: string
  ) => {
    const getUrl = `https://firebasestorage.googleapis.com/v0/b/locket-video/o/users%2F${idUser}%2Fmoments%2Fvideos%2F${nameVideo}`;

    const getHeaders = {
      "content-type": "application/json; charset=UTF-8",
      authorization: `Bearer ${idToken}`,
    };

    const response = await axios.get(getUrl, {
      headers: getHeaders,
    });

    const downloadToken = response.data.downloadTokens;
    return `${getUrl}?alt=media&token=${downloadToken}`;
  },
};

// Image compression utility
export const compressImage = async (
  file: File,
  maxWidth: number = 1020,
  quality: number = 1
): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: "image/jpeg",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        "image/jpeg",
        quality
      );
    };

    img.src = URL.createObjectURL(file);
  });
};

// Video thumbnail generation
export const generateVideoThumbnail = (videoFile: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    video.addEventListener("loadeddata", () => {
      video.currentTime = 1; // Get thumbnail at 1 second
    });

    video.addEventListener("seeked", () => {
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const thumbnailDataUrl = canvas.toDataURL("image/jpeg");
        resolve(thumbnailDataUrl);
      } else {
        reject(new Error("Could not get canvas context"));
      }
    });

    video.addEventListener("error", () => {
      reject(new Error("Error loading video"));
    });

    video.src = URL.createObjectURL(videoFile);
    video.load();
  });
};
