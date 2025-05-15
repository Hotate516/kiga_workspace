"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useUserStore } from "@/store/user";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from 'react-hot-toast';

const Sidebar = ({ active }: { active?: string }) => (
  <aside className="w-64 bg-gradient-to-b from-purple-600 to-pink-600 text-white p-5 flex flex-col shadow-2xl min-h-screen">
    <div className="flex items-center mb-6 pt-2">
      <svg
        className="w-5 h-5 mr-2 text-white"
        viewBox="0 0 28 28"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
      >
        <path d="M6.99999 5.00003L14 12.0001L6.99999 19V5.00003Z M15 5H20V19H15V5Z"></path>
      </svg>
      <div>
        <span className="text-xl font-bold tracking-tight">Kiga Workspace</span>
        <p className="text-xs text-purple-200 opacity-90 font-medium">
          Key Intelligence Gateway for Advancement
        </p>
      </div>
    </div>
    <div className="border-t border-white/20 my-4"></div>
    <nav className="space-y-1">
      <a href="/dashboard" className="block py-2.5 px-3 rounded-lg transition duration-200 hover:bg-white/10">
        ダッシュボード
      </a>
      <a href="/dashboard/profile" className="block py-2.5 px-3 rounded-lg bg-white/10">
        プロフィール
      </a>
    </nav>
    <div className="border-t border-white/20 my-4 mt-auto" />
    <div className="text-sm text-white text-center opacity-60">© 2024 Kiga Workspace</div>
  </aside>
);

export default function ProfilePage() {
  const { user, setUser , clearUser} = useUserStore();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);

  const fallbackImage = "/default-icon.png";

  const handleSave = async () => {
    if (!user) return;
    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { name });
    setUser({ ...user, name });
    // ✅ 保存完了のトースト通知
    toast.success("プロフィールを保存しました 🎉");
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    const currentUser = auth.currentUser;

    if (!file || !currentUser) return;

    setLoading(true);
    try {
      const storageRef = ref(storage, `userIcons/${currentUser.uid}/profile.jpg`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const userRef = doc(db, "users", currentUser.uid);
      await updateDoc(userRef, { photoURL: downloadURL });

      // Firestoreから再フェッチして最新ユーザー情報をセット
      const freshSnap = await getDoc(userRef);
      const freshData = freshSnap.data();
      if (freshData) {
        setUser({
          uid: freshData.uid,
          name: freshData.name,
          email: freshData.email,
          photoURL: freshData.photoURL ?? "",
        });
      }
    } catch (err) {
      console.error("Upload failed", err);
      alert("アップロード失敗");
    } finally {
      setLoading(false);
    }
  };

  const [loaded, setLoaded] = useState(false);

useEffect(() => {
  console.log("Auth observer starting...");

  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    console.log("onAuthStateChanged triggered", firebaseUser);

    if (firebaseUser) {
      const userRef = doc(db, "users", firebaseUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        console.log("User data loaded:", userData);

        setUser({
          uid: firebaseUser.uid,
          name: userData.name,
          email: userData.email,
          photoURL: userData.photoURL ?? "",
        });
      }
    } else {
      console.log("No user signed in.");
      clearUser();
    }

    setLoaded(true);
  });

  return () => unsubscribe();
}, [setUser, clearUser]);



if (!loaded) return <div className="p-8">読み込み中...</div>;



  return (
    <div className="flex min-h-screen">
      <Sidebar active="profile" />
      <main className="flex-1 p-8 bg-slate-100">
        <h2 className="text-3xl font-bold mb-6">プロフィール設定</h2>
        <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-md">
          <div className="flex justify-center mb-6">
            <img
              src={user?.photoURL || fallbackImage}
              onError={(e) => {
                e.currentTarget.src = fallbackImage;
              }}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-pink-500"
            />
          </div>
          <div className="flex justify-center mb-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="text-sm text-blue-500 hover:underline"
            >
              {loading ? "アップロード中..." : "画像を変更"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          <label className="block mb-2 font-semibold">表示名</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded mb-4"
            type="text"
            placeholder="名前を入力"
          />
          <p className="text-sm text-gray-500 mb-4">{user?.email}</p>
          <button
            onClick={handleSave}
            className="w-full bg-indigo-600 text-white py-2 rounded mb-3 hover:bg-indigo-700"
          >
            保存
          </button>
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600"
          >
            ログアウト
          </button>
        </div>
      </main>
    </div>
  );
}
