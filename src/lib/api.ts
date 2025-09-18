import axios from "axios";

const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;

// Firebase API endpoints
const FIREBASE_BASE_URL =
  "https://www.googleapis.com/identitytoolkit/v3/relyingparty";
export const LOCKET_API_BASE_URL = "https://api.locketcamera.com";

// Headers
const loginHeader = {
  "Content-Type": "application/json",
  "Accept-Language": "en-US",
  //"User-agent":
  //   "FirebaseAuth.iOS/10.23.1 com.locket.Locket/1.82.0 iPhone/18.0 hw/iPhone12_1",
  "X-Ios-Bundle-Identifier": "com.locket.Locket",
  "X-Client-Version": "iOS/FirebaseSDK/10.23.1/FirebaseCore-iOS",
  "X-Firebase-GMPID": "1:641029076083:ios:cc8eb46290d69b234fa606",
  "X-Firebase-Client":
    "H4sIAAAAAAAAAKtWykhNLCpJSk0sKVayio7VUSpLLSrOzM9TslIyUqoFAFyivEQfAAAA",
  "X-Firebase-AppCheck":
    "eyJraWQiOiJNbjVDS1EiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxOjY0MTAyOTA3NjA4Mzppb3M6Y2M4ZWI0NjI5MGQ2OWIyMzRmYTYwNiIsImF1ZCI6WyJwcm9qZWN0c1wvNjQxMDI5MDc2MDgzIiwicHJvamVjdHNcL2xvY2tldC00MjUyYSJdLCJwcm92aWRlciI6ImRldmljZV9jaGVja19kZXZpY2VfaWRlbnRpZmljYXRpb24iLCJpc3MiOiJodHRwczpcL1wvZmlyZWJhc2VhcHBjaGVjay5nb29nbGVhcGlzLmNvbVwvNjQxMDI5MDc2MDgzIiwiZXhwIjoxNzIyMTY3ODk4LCJpYXQiOjE3MjIxNjQyOTgsImp0aSI6ImlHUGlsT1dDZGg4Mll3UTJXRC1neEpXeWY5TU9RRFhHcU5OR3AzTjFmRGcifQ.lqTOJfdoYLpZwYeeXtRliCdkVT7HMd7_Lj-d44BNTGuxSYPIa9yVAR4upu3vbZSh9mVHYS8kJGYtMqjP-L6YXsk_qsV_gzKC2IhVAV6KbPDRHdevMfBC6fRiOSVn7vt749GVFdZqAuDCXhCILsaMhvgDBgZoDilgAPtpNwyjz-VtRB7OdOUbuKTCqdoSOX0SJWVUMyuI8nH0-unY--YRctunK8JHZDxBaM_ahVggYPWBCpzxq9Yeq8VSPhadG_tGNaADStYPaeeUkZ7DajwWqH5ze6ESpuFNgAigwPxCM735_ZiPeD7zHYwppQA9uqTWszK9v9OvWtFCsgCEe22O8awbNbuEBTKJpDQ8xvZe8iEYyhfUPncER3S-b1CmuXR7tFCdTgQe5j7NGWjFvN_CnL7D2nudLwxWlpqwASCHvHyi8HBaJ5GpgriTLXAAinY48RukRDBi9HwEzpRecELX05KTD2lTOfQCjKyGpfG2VUHP5Xm36YbA3iqTDoDXWMvV",
};

// Auth API functions
export const authAPI = {
  login: async (email: string, password: string) => {
    const body = {
      email,
      password,
      clientType: "CLIENT_TYPE_IOS",
      returnSecureToken: true,
    };

    const response = await axios.post(
      `${FIREBASE_BASE_URL}/verifyPassword?key=${GOOGLE_API_KEY}`,
      body,
      { headers: loginHeader }
    );

    if (response.status < 400) {
      return response.data;
    } else {
      throw new Error(response.data?.error?.message || "Login failed");
    }
  },

  resetPassword: async (email: string) => {
    const body = {
      data: { email: email },
    };

    const response = await axios.post(
      `${LOCKET_API_BASE_URL}/sendPasswordResetEmail`,
      body
    );

    const statusCode = response.data?.result?.status;
    const res =
      response.status === 200 && statusCode !== 401 && statusCode !== 500;

    if (res) {
      return "Reset Password Email Sent Successfully.";
    } else {
      throw new Error("Failed to send reset password email");
    }
  },

  getAccessToken: async (refreshToken: string) => {
    const body = {
      grant_type: "refresh_token",
      refreshToken,
    };

    const response = await axios.post(
      `https://securetoken.googleapis.com/v1/token?key=${GOOGLE_API_KEY}`,
      body,
      { headers: loginHeader }
    );

    return response.data;
  },

  getAccountInfo: async (idToken: string) => {
    const body = { idToken };

    const response = await axios.post(
      `${FIREBASE_BASE_URL}/getAccountInfo?key=${GOOGLE_API_KEY}`,
      body,
      { headers: loginHeader }
    );

    return response.data;
  },

  fetchUser: async (user_uid: string, token: string) => {
    return await axios.post(
      `${LOCKET_API_BASE_URL}/fetchUserV2`,
      {
        data: { user_uid },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
  },

  updateDisplayName: async (
    first_name: string,
    last_name: string,
    idToken: string
  ) => {
    const body = {
      data: { first_name, last_name },
    };

    const response = await axios.post(
      `${LOCKET_API_BASE_URL}/changeProfileInfo`,
      body,
      {
        headers: {
          ...loginHeader,
          Authorization: "Bearer " + idToken,
        },
      }
    );

    return response.data;
  },

  getMoment: async (idToken: string, exclude?: string[]) => {
    const body = {
      data: {
        // last_fetch: 99,
        // should_count_missed_moments: true,
        exclude: exclude,
      },
    };
    const response = await axios.post(
      `${LOCKET_API_BASE_URL}/getLatestMomentV2`,
      body,
      {
        headers: {
          ...loginHeader,
          Authorization: "Bearer " + idToken,
        },
      }
    );

    return {
      userId: response.data?.result?.data?.[0]?.user || "",
      token: response.data?.result?.sync_token,
    };
  },

  updateAvatar: async (profile_picture_url: string, idToken: string) => {
    const body = {
      data: { profile_picture_url },
    };

    const response = await axios.post(
      `${LOCKET_API_BASE_URL}/changeProfileInfo`,
      body,
      {
        headers: {
          ...loginHeader,
          Authorization: "Bearer " + idToken,
        },
      }
    );

    return response.data;
  },
};

// Friends API functions
export const friendsAPI = {
  getListIdFriend: async (token: string, userId: string) => {
    const response = await axios.post(
      "https://file.quockhanh020924.id.vn/listen",
      { token, userId }
    );
    return response.data.users;
  },

  getListFriend: async (token: string, listIdFriend: string[]) => {
    const friendPromises = listIdFriend.map(async (friendId) => {
      try {
        const response = await authAPI.fetchUser(friendId, token);
        const data = response.data.result.data;

        if (data && data.uid) {
          return data;
        } else {
          throw new Error(`Friend data for ${friendId} is invalid.`);
        }
      } catch (error) {
        console.error(`Error fetching friend ${friendId}:`, error);
        throw error;
      }
    });

    return Promise.all(friendPromises);
  },
};

// Posts API functions
export const postsAPI = {
  postMoment: async (
    data: any,
    // data: {
    //   caption: string;
    //   thumbnail_url: string;
    //   video_url?: string;
    //   recipients: string[];
    // },
    idToken: string
  ) => {
    const body = { data };
    const postHeaders = {
      "content-type": "application/json",
      authorization: `Bearer ${idToken}`,
    };

    const response = await axios.post(
      `${LOCKET_API_BASE_URL}/postMomentV2`,
      body,
      {
        headers: postHeaders,
        // headers: {
        //   ...loginHeader,
        //   Authorization: `Bearer ${idToken}`,
        // },
      }
    );

    if (response.status < 400) {
      return response.data;
    } else {
      throw new Error(response.data?.error?.message || "Post failed");
    }
  },
};

export const cretateBody = (
  caption: string,
  thumbnailUrl: string,
  downloadVideoUrl: string,
  friends?: string[]
) => {
  const bodyPostMoment = {
    data: {
      thumbnail_url: thumbnailUrl,
      video_url: downloadVideoUrl,
      recipients: friends || [],
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
            value: "1203",
            "@type": "type.googleapis.com/google.protobuf.Int64Value",
          },
          flag_19: {
            value: "52",
            "@type": "type.googleapis.com/google.protobuf.Int64Value",
          },
          flag_18: {
            "@type": "type.googleapis.com/google.protobuf.Int64Value",
            value: "1203",
          },
          flag_16: {
            value: "303",
            "@type": "type.googleapis.com/google.protobuf.Int64Value",
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
            background: { material_blur: "ultra_thin", colors: [] },
          },
          alt_text: caption,
          overlay_id: "caption:standard",
          overlay_type: "caption",
        },
      ],
    },
  };

  return bodyPostMoment;
};
