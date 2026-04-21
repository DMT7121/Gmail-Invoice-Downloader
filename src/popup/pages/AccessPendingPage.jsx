// ============================================================
// AccessPendingPage.jsx — Trang chờ phê duyệt
// ============================================================

import React from 'react';

export function AccessPendingPage({ email, status }) {
  const isBlocked = status === 'blocked';

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: '100vh',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{ 
        fontSize: '48px', 
        marginBottom: '20px',
        animation: isBlocked ? 'none' : 'pulse 2s infinite' 
      }}>
        {isBlocked ? '🚫' : '⏳'}
      </div>
      
      <h2 style={{ color: '#1e293b', marginBottom: '10px' }}>
        {isBlocked ? 'Truy cập bị từ chối' : 'Đang chờ phê duyệt'}
      </h2>
      
      <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6' }}>
        {isBlocked 
          ? `Tài khoản (${email}) của bạn đã bị khóa bởi quản trị viên.`
          : `Tài khoản (${email}) đã được đăng ký. Vui lòng liên hệ chủ extension để được kích hoạt sử dụng bất kỳ đâu.`
        }
      </p>

      {!isBlocked && (
        <div style={{ 
          marginTop: '30px', 
          padding: '12px 20px', 
          backgroundColor: '#e0f2fe', 
          color: '#0369a1',
          borderRadius: '8px',
          fontSize: '13px',
          fontWeight: '500'
        }}>
          Hệ thống sẽ tự động chuyển hướng khi được kích hoạt
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.7; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
