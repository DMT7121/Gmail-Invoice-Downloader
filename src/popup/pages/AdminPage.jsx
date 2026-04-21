// ============================================================
// AdminPage.jsx — Trang quản trị (Dành cho chủ extension)
// ============================================================

import React, { useEffect } from 'react';

export function AdminPage({ licenseProps }) {
  const { pendingUsers, fetchPendingUsers, approveUser, blockUser } = licenseProps;

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  return (
    <div style={{ padding: '20px', height: '100vh', overflowY: 'auto', backgroundColor: '#fff' }}>
      <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>Quản lý người dùng</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {pendingUsers.length === 0 ? (
          <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '40px' }}>
            Chưa có người dùng nào đăng ký.
          </p>
        ) : (
          pendingUsers.map((user) => (
            <div key={user.id} style={{ 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ fontWeight: '500', color: '#334155' }}>{user.email}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  fontSize: '11px', 
                  padding: '2px 8px', 
                  borderRadius: '10px',
                  backgroundColor: user.status === 'active' ? '#dcfce7' : (user.status === 'blocked' ? '#fee2e2' : '#fef9c3'),
                  color: user.status === 'active' ? '#166534' : (user.status === 'blocked' ? '#991b1b' : '#854d0e')
                }}>
                  {user.status.toUpperCase()}
                </span>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {user.status !== 'active' && (
                    <button 
                      onClick={() => approveUser(user.email)}
                      style={{ 
                        padding: '4px 10px', 
                        backgroundColor: '#2563eb', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Kích hoạt
                    </button>
                  )}
                  {user.status !== 'blocked' && (
                    <button 
                      onClick={() => blockUser(user.email)}
                      style={{ 
                        padding: '4px 10px', 
                        backgroundColor: '#ef4444', 
                        color: 'white', 
                        border: 'none', 
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Chặn
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
