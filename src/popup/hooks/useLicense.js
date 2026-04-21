// ============================================================
// useLicense.js — Hook quản lý bản quyền và phê duyệt
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { db } from '../../shared/firebase.js';
import { 
  doc, 
  getDoc, 
  setDoc, 
  onSnapshot, 
  serverTimestamp,
  collection,
  getDocs,
  updateDoc,
  query,
  orderBy
} from 'firebase/firestore';
import { ADMIN_EMAIL } from '../../shared/constants.js';

export function useLicense(email) {
  const [licenseStatus, setLicenseStatus] = useState('loading'); // loading, pending, active, blocked, error
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [error, setError] = useState(null);

  // Kiểm tra quyền khi email thay đổi
  useEffect(() => {
    if (!email) {
      setLicenseStatus('loading');
      setIsAdmin(false);
      return;
    }

    setIsAdmin(email.toLowerCase() === ADMIN_EMAIL.toLowerCase());

    const checkLicense = async () => {
      try {
        const docRef = doc(db, 'licenses', email.toLowerCase());
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setLicenseStatus(docSnap.data().status);
        } else {
          // Nếu email admin chưa có trong DB, tự động tạo là active
          if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
            await setDoc(docRef, {
              email: email.toLowerCase(),
              status: 'active',
              role: 'admin',
              createdAt: serverTimestamp()
            });
            setLicenseStatus('active');
          } else {
            // User mới -> Gửi yêu cầu access
            await setDoc(docRef, {
              email: email.toLowerCase(),
              status: 'pending',
              role: 'user',
              createdAt: serverTimestamp()
            });
            setLicenseStatus('pending');
          }
        }
      } catch (err) {
        console.error('License check error:', err);
        setError(err.message);
        setLicenseStatus('error');
      }
    };

    // Lắng nghe thay đổi trạng thái theo thời gian thực
    const unsubscribe = onSnapshot(doc(db, 'licenses', email.toLowerCase()), (doc) => {
      if (doc.exists()) {
        setLicenseStatus(doc.data().status);
      }
    });

    checkLicense();

    return () => unsubscribe();
  }, [email]);

  // Lấy danh sách user chờ duyệt (chỉ dành cho Admin)
  const fetchPendingUsers = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const q = query(collection(db, 'licenses'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const users = [];
      querySnapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      setPendingUsers(users);
    } catch (err) {
      console.error('Fetch pending users error:', err);
    }
  }, [isAdmin]);

  // Phê duyệt user
  const approveUser = async (userEmail) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'licenses', userEmail.toLowerCase()), {
        status: 'active',
        approvedAt: serverTimestamp()
      });
      await fetchPendingUsers();
    } catch (err) {
      console.error('Approve user error:', err);
    }
  };

  // Chặn user
  const blockUser = async (userEmail) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'licenses', userEmail.toLowerCase()), {
        status: 'blocked'
      });
      await fetchPendingUsers();
    } catch (err) {
      console.error('Block user error:', err);
    }
  };

  return {
    licenseStatus,
    isAdmin,
    pendingUsers,
    error,
    fetchPendingUsers,
    approveUser,
    blockUser
  };
}
