# Locket Web - Cloned Features from React Native

## Tổng quan

Dự án này đã clone các tính năng chính từ React Native app sang Next.js web app, sử dụng Zustand thay vì Redux.

## Các tính năng đã clone

### 1. Authentication (Đăng nhập)

- ✅ Login với email/password qua Firebase
- ✅ Reset password
- ✅ Token refresh tự động
- ✅ Lưu trữ user state với Zustand
- ✅ Persistent storage

### 2. Post Media (Đăng bài)

- ✅ Upload ảnh với compression
- ✅ Upload video với thumbnail generation
- ✅ Progress tracking cho upload
- ✅ Caption support
- ✅ Friend selection cho recipients

### 3. Friends Management (Quản lý bạn bè)

- ✅ Lấy danh sách friends từ API
- ✅ Select friends cho posts
- ✅ Friend selection UI

### 4. State Management

- ✅ Zustand stores thay thế Redux:
  - `authStore` - Quản lý authentication
  - `friendsStore` - Quản lý danh sách bạn bè
  - `postsStore` - Quản lý posts và upload progress
  - `messageStore` - Quản lý thông báo

## Cấu trúc thư mục

```
src/
├── stores/           # Zustand stores
│   ├── authStore.ts
│   ├── friendsStore.ts
│   ├── postsStore.ts
│   └── messageStore.ts
├── hooks/            # Custom hooks
│   ├── useAuth.ts
│   ├── useFriends.ts
│   └── usePosts.ts
├── lib/              # Utilities và API
│   ├── api.ts
│   ├── uploadUtils.ts
│   └── firebase.ts
└── components/       # React components
    ├── LoginForm.tsx
    ├── HomeScreen.tsx
    └── ProtectedRoute.tsx
```

## Cài đặt

1. Cài đặt dependencies:

```bash
npm install zustand
```

2. Tạo file `.env.local`:

```env
NEXT_PUBLIC_GOOGLE_API_KEY=your_google_api_key_here
```

3. Chạy ứng dụng:

```bash
npm run dev
```

## API Endpoints sử dụng

### Authentication

- `POST /verifyPassword` - Login
- `POST /getAccountInfo` - Lấy thông tin user
- `POST /sendPasswordResetEmail` - Reset password
- `POST /changeProfileInfo` - Cập nhật profile

### Friends

- `POST /listen` - Lấy danh sách friend IDs
- `POST /fetchUserV2` - Lấy thông tin chi tiết friend

### Posts

- `POST /postMomentV2` - Tạo post mới

### Upload

- Firebase Storage cho ảnh: `locket-img` bucket
- Firebase Storage cho video: `locket-video` bucket

## Tính năng chính

### 1. Login Form

- Input email/password
- Validation
- Error handling
- Reset password

### 2. Home Screen

- Upload media (ảnh/video)
- Caption input
- Friend selection
- Post creation
- Progress tracking
- Message display

### 3. State Management

- Persistent auth state
- Real-time updates
- Error handling
- Loading states

## Khác biệt với React Native

1. **State Management**: Zustand thay vì Redux
2. **File Upload**: HTML5 File API thay vì React Native
3. **Image Compression**: Canvas API thay vì react-native-compressor
4. **Video Thumbnail**: HTML5 Video API thay vì react-native-create-thumbnail
5. **Storage**: LocalStorage thay vì AsyncStorage

## Lưu ý

- Cần cấu hình Google API key trong environment variables
- Firebase Storage buckets cần được cấu hình đúng
- CORS settings cần được cấu hình cho các API endpoints
- Video compression có thể cần tối ưu thêm cho web

## Các tính năng không clone

- Crop image (theo yêu cầu)
- Notifications (theo yêu cầu)
- Camera integration (không cần thiết cho web)
