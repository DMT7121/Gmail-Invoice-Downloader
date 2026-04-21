# 🔐 Hướng dẫn thiết lập Google Cloud Console cho Gmail Invoice Downloader

## Bước 1: Tạo Google Cloud Project

1. Truy cập **[Google Cloud Console](https://console.cloud.google.com/)**
2. Click **"Select a project"** (góc trên bên trái) → **"New Project"**
3. Đặt tên project: `Gmail Invoice Downloader`
4. Click **"Create"**

## Bước 2: Bật Gmail API

1. Trong menu bên trái, chọn **"APIs & Services"** → **"Library"**
2. Tìm kiếm **"Gmail API"**
3. Click vào **Gmail API** → Click nút **"Enable"**

## Bước 3: Tạo OAuth Consent Screen

1. Vào **"APIs & Services"** → **"OAuth consent screen"**
2. Chọn User Type: **External** → Click **"Create"**
3. Điền thông tin:
   - **App name**: `Gmail Invoice Downloader`
   - **User support email**: email của bạn
   - **Developer contact information**: email của bạn
4. Click **"Save and Continue"**

### Thêm Scopes:
5. Click **"Add or Remove Scopes"**
6. Tìm và check **`https://www.googleapis.com/auth/gmail.readonly`**
7. Click **"Update"** → **"Save and Continue"**

### Thêm Test Users (QUAN TRỌNG):
8. Click **"Add Users"**
9. Nhập **TẤT CẢ email Gmail bạn muốn quét** (có thể thêm nhiều email)
10. Click **"Add"** → **"Save and Continue"**

> ⚠️ **LƯU Ý**: Vì app đang ở chế độ "Testing", chỉ những email được thêm vào Test Users mới có thể đăng nhập được.

## Bước 4: Lấy Extension ID

**Trước khi tạo OAuth Client ID, bạn cần Extension ID:**

1. Mở Chrome, vào `chrome://extensions/`
2. Bật **Developer mode** (góc trên bên phải)
3. Click **"Load unpacked"** → Chọn thư mục `dist` trong project
4. Copy **Extension ID** (chuỗi ký tự dài dưới tên extension)

> Ví dụ: `abcdefghijklmnopqrstuvwxyz`

## Bước 5: Tạo OAuth Client ID (⚠️ QUAN TRỌNG — Chọn "Web application")

> 🔴 **KHÔNG chọn "Chrome extension"** — Chọn **"Web application"** để extension có thể quét bất kỳ tài khoản Gmail nào!

1. Quay lại Google Cloud Console
2. Vào **"APIs & Services"** → **"Credentials"**
3. Click **"+ Create Credentials"** → **"OAuth client ID"**
4. **Application type**: Chọn **"Web application"** ⚠️
5. **Name**: `Gmail Invoice Downloader`
6. Ở phần **"Authorized redirect URIs"**, click **"+ ADD URI"**
7. Nhập URL theo format: `https://YOUR_EXTENSION_ID.chromiumapp.org/`
   - Thay `YOUR_EXTENSION_ID` bằng Extension ID từ bước 4
   - Ví dụ: `https://abcdefghijklmnopqrstuvwxyz.chromiumapp.org/`
8. Click **"Create"**
9. **Copy Client ID** (dạng: `xxxx.apps.googleusercontent.com`)

## Bước 6: Cập nhật Client ID vào Extension

1. Mở file `manifest.json` trong project (file gốc, KHÔNG phải trong dist)
2. Tìm dòng `"client_id": "..."` trong phần `oauth2`
3. Thay bằng Client ID vừa copy
4. **ĐỒNG THỜI** mở file `src/background/index.js`
5. Tìm dòng `const OAUTH_CLIENT_ID = '...'`
6. Thay bằng cùng Client ID
7. Lưu cả 2 file
8. Chạy lại `npm run build`
9. Quay lại `chrome://extensions/` → Click nút 🔄 (reload) trên extension

## Bước 7: Test đăng nhập

1. Click vào icon extension trên thanh toolbar Chrome
2. Click **"Đăng nhập với Google"**
3. 🎯 **Cửa sổ popup hiện ra cho phép bạn CHỌN BẤT KỲ tài khoản Gmail nào**
4. Chọn tài khoản cần quét (phải nằm trong Test Users)
5. Cấp quyền **"Xem tin nhắn và cài đặt email"**
6. ✅ Đăng nhập thành công! Extension sẽ quét email trên tài khoản Gmail bạn chọn

> 💡 Muốn chuyển sang Gmail khác? Chỉ cần **Đăng xuất** rồi **Đăng nhập lại** — sẽ hiện lại popup chọn tài khoản.

---

## 🔧 Xử lý sự cố

### Lỗi "This app isn't verified"
- Đây là bình thường khi app đang ở chế độ Testing
- Click **"Advanced"** → **"Go to Gmail Invoice Downloader (unsafe)"**
- App vẫn an toàn vì chỉ sử dụng scope `gmail.readonly` (chỉ đọc)

### Lỗi "redirect_uri_mismatch"
- Redirect URI trong Google Cloud Console KHÔNG khớp với Extension ID
- Kiểm tra lại:
  1. Vào `chrome://extensions/` → Copy Extension ID
  2. Vào Google Cloud Console → Credentials → Edit OAuth Client
  3. Sửa Authorized redirect URI thành `https://YOUR_EXTENSION_ID.chromiumapp.org/`
  4. Đảm bảo có dấu `/` ở cuối

### Lỗi "Access blocked: Authorization Error"
- Đảm bảo email bạn chọn đã được thêm vào **Test Users** trong OAuth Consent Screen
- Kiểm tra Client ID đã copy đúng vào cả `manifest.json` và `src/background/index.js`

### Lỗi "Token expired"
- Token access_token chỉ có hiệu lực ~1 giờ
- Đăng xuất rồi đăng nhập lại để lấy token mới

### Muốn quét Gmail khác
- Click **Đăng xuất** → Click **Đăng nhập** → Chọn tài khoản Gmail khác
- Nhớ thêm email đó vào **Test Users** trước

### Muốn thêm user khác sử dụng
- Vào OAuth Consent Screen → Test Users → Add thêm email mới
- Tối đa 100 test users khi app ở chế độ Testing
