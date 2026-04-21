# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not## 🚀 Triển khai & Cấu hình

### 1. Đẩy lên GitHub
Để chia sẻ code và sử dụng ở bất kỳ đâu, hãy chạy các lệnh sau trong terminal:
```bash
# 1. Thêm địa chỉ repo của bạn (Tạo repo mới trên github.com trước)
git remote add origin https://github.com/TEN_USER_CUA_BAN/TEN_REPO.git

# 2. Đẩy code lên
git branch -M main
git push -u origin main
```

### 2. Cấu hình Bản quyền (Licensing)
Extension này đã được tích hợp hệ thống phê duyệt người dùng qua **Firebase**. Để hoạt động:

1. Truy cập [Firebase Console](https://console.firebase.google.com/).
2. Tạo Project mới.
3. Vào **Build > Firestore Database** và nhấn **Create Database**.
4. Vào **Project Settings > General** và thêm một Web App để lấy các mã cấu hình.
5. Copy thông tin cấu hình vào file `src/shared/constants.js`.
6. Thay đổi `ADMIN_EMAIL` trong file đó thành email của bạn.

### 3. Cách hoạt động của Phê duyệt
- **Người dùng khách**: Khi đăng nhập bằng bất kỳ Gmail nào, họ sẽ thấy thông báo "Chờ phê duyệt".
- **Chủ extension (Admin)**: Khi bạn đăng nhập bằng email đã đặt làm Admin, bạn sẽ thấy tab **⚙️ Admin**. Tại đây, bạn có thể nhấn **Kích hoạt** để cho phép người dùng đó sử dụng.
- Sau khi được kích hoạt, extension của khách sẽ tự động mở khóa tính năng.
 enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
