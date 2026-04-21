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

export default function App() {
  const auth = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [scanData, setScanData] = useState(null);

  // Show loading while checking auth
  if (auth.loading && !auth.isLoggedIn) {
    return (
      <div className="app">
        <div className="login-page">
          <div className="spinner spinner-lg"></div>
        </div>
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
      />
      <div className="app-content">
        {renderPage()}
      </div>
    </div>
  );
}
