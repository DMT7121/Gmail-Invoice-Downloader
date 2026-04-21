// ============================================================
// App.jsx — Root Component with simple state-based routing
// ============================================================

import { useState } from 'react';
import { useAuth } from './hooks/useAuth.js';
import Header from './components/Header.jsx';
import LoginPage from './pages/LoginPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ResultsPage from './pages/ResultsPage.jsx';
import HistoryPage from './pages/HistoryPage.jsx';
import { useLicense } from './hooks/useLicense.js';
import { AccessPendingPage } from './pages/AccessPendingPage.jsx';
import { AdminPage } from './pages/AdminPage.jsx';


export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [scanData, setScanData] = useState(null);
  const auth = useAuth();
  const license = useLicense(auth.email);


  // Show loading while checking auth or license
  if ((auth.loading && !auth.isLoggedIn) || (auth.isLoggedIn && license.licenseStatus === 'loading')) {
    return (
      <div className="app">
        <div className="login-page">
          <div className="spinner spinner-lg"></div>
          {auth.isLoggedIn && <p style={{ marginTop: '10px', fontSize: '12px' }}>Đang kiểm tra quyền truy cập...</p>}
        </div>
      </div>
    );
  }

  // Show error if license check failed
  if (license.licenseStatus === 'error') {
    return (
      <div className="app" style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '40px' }}>❌</div>
        <h2>Lỗi kết nối hệ thống</h2>
        <p style={{ color: '#ef4444', fontSize: '13px' }}>{license.error}</p>
        <button 
          className="btn btn-primary" 
          onClick={() => window.location.reload()}
          style={{ marginTop: '20px' }}
        >
          Thử lại
        </button>
      </div>
    );
  }

  // Show login if not authenticated
  if (!auth.isLoggedIn) {

    return (
      <div className="app">
        <LoginPage auth={auth} />
      </div>
    );
  }

  // Show pending/blocked screen if not active
  if (license.licenseStatus === 'pending' || license.licenseStatus === 'blocked') {
    return (
      <div className="app">
        <AccessPendingPage email={auth.email} status={license.licenseStatus} />
      </div>
    );
  }


  // Navigate handler
  const navigate = (page, data = null) => {
    setCurrentPage(page);
    if (data) setScanData(data);
  };

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage navigate={navigate} />;
      case 'results':
        return <ResultsPage scanData={scanData} navigate={navigate} />;
      case 'history':
        return <HistoryPage navigate={navigate} />;
      case 'admin':
        return license.isAdmin ? <AdminPage licenseProps={license} /> : <DashboardPage navigate={navigate} />;
      default:
        return <DashboardPage navigate={navigate} />;
    }
  };


  return (
    <div className="app">
      <Header
        email={auth.email}
        currentPage={currentPage}
        navigate={navigate}
        onLogout={auth.logout}
        isAdmin={license.isAdmin}
      />

      <div className="app-content">
        {renderPage()}
      </div>
    </div>
  );
}
