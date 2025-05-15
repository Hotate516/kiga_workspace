"use client";

import { useEffect } from "react";
import { useUserStore } from "@/store/user";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { setUser, setLoaded, loaded } = useUserStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setUser({
            uid: firebaseUser.uid,
            name: data.name || "ユーザー",
            email: data.email || firebaseUser.email,
            photoURL: data.photoURL || "",
          });
        }
      }
      setLoaded(true); // ← ユーザーがいてもいなくても一度だけ呼ぶことが重要
    });

    return () => unsubscribe();
  }, [setUser, setLoaded]);

  if (!loaded) {
    return <div className="p-6 text-gray-500">読み込み中...</div>;
  }

  return <>{children}</>;
}
