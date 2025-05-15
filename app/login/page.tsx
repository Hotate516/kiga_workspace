'use client';

import { auth, db } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Firestore にユーザー情報保存（初回だけ）
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          createdAt: new Date(),
        });
      }

      router.push('/dashboard');
    } catch (error) {
      console.error(error);
      alert('ログイン失敗しました');
    }
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f4f4f4',
    }}>
      <div style={{
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        width: '350px',
        textAlign: 'center',
      }}>
        <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>KigaWorkSpaceへようこそ</h2>
        <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
          Google アカウントでログインしてください
        </p>
        <button
          onClick={handleLogin}
          style={{
            backgroundColor: '#0070f3',
            color: '#fff',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '6px',
            fontSize: '1rem',
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Googleでログイン
        </button>
      </div>
    </div>
  );
}
