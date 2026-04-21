// ============================================================
// Header.jsx — App header with brand, user info, navigation
// ============================================================

export default function Header({ email, currentPage, navigate, onLogout }) {
  return (
    <header className="header">
      <div className="header-brand">
        <div className="header-logo">📄</div>
        <div>
          <div className="header-title">Invoice DL</div>
        </div>
      </div>

      <nav className="nav-tabs" style={{ flex: '0 0 auto', maxWidth: '200px' }}>
        <button
          className={`nav-tab ${currentPage === 'dashboard' ? 'active' : ''}`}
          onClick={() => navigate('dashboard')}
        >
          🔍 Quét
        </button>
        <button
          className={`nav-tab ${currentPage === 'history' ? 'active' : ''}`}
          onClick={() => navigate('history')}
        >
          📋 Lịch sử
        </button>
      </nav>

      <div className="header-user">
        <span className="header-email" title={email}>{email}</span>
        <button
          className="btn btn-icon btn-ghost"
          onClick={onLogout}
          title="Đăng xuất"
        >
          🚪
        </button>
      </div>
    </header>
  );
}
