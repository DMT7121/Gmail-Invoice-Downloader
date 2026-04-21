// ============================================================
// LoginPage.jsx — Trang đăng nhập OAuth
// ============================================================

export default function LoginPage({ auth }) {
  return (
    <div className="login-page">
      <div className="login-icon">📄</div>

      <h1 className="login-title">Gmail Invoice Downloader</h1>
      <p className="login-desc">
        Tự động quét, trích xuất và tải hàng loạt hóa đơn đầu vào từ email của nhà cung cấp.
      </p>

      <button
        className="btn btn-primary btn-lg"
        onClick={auth.login}
        disabled={auth.loading}
      >
        {auth.loading ? (
          <>
            <div className="spinner"></div>
            Đang kết nối...
          </>
        ) : (
          <>
            🔐 Đăng nhập với Google
          </>
        )}
      </button>

      {auth.error && (
        <div className="alert alert-error mt-4" style={{ maxWidth: '300px' }}>
          <span className="alert-icon">❌</span>
          <span>{auth.error}</span>
        </div>
      )}

      <div className="login-features">
        <div className="login-feature">
          <span className="login-feature-icon">🔍</span>
          <span>Quét email theo từ khóa, thời gian, loại file</span>
        </div>
        <div className="login-feature">
          <span className="login-feature-icon">📦</span>
          <span>Tải hàng loạt PDF, XML, ZIP đóng gói một lần</span>
        </div>
        <div className="login-feature">
          <span className="login-feature-icon">🏷️</span>
          <span>Tự động đổi tên theo chuẩn kế toán</span>
        </div>
      </div>
    </div>
  );
}
