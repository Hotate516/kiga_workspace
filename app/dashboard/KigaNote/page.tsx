// app/dashboard/KigaNote/page.tsx
"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { auth, db, storage } from "@/lib/firebase";
import { ref, uploadString, getDownloadURL, getBytes } from "firebase/storage";
// import { doc, getDoc, setDoc } from "firebase/firestore"; // Firestore関連は親Layoutで処理される想定
import { useUserStore } from "@/store/user"; // Zustandストアをインポート
import { toast } from 'react-hot-toast';

// アイコンコンポーネント (変更なし)
const KigaLogoIcon = () => (
    <svg
        className="w-5 h-5 mr-2 text-white"
        viewBox="0 0 28 28"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
    >
        <path d="M6.99999 5.00003L14 12.0001L6.99999 19V5.00003Z M15 5H20V19H15V5Z"></path>
    </svg>
);

const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const Squares2X2Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);
const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const TypeIcon = () => <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.293 3.293a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L10 5.414 5.707 9.707a1 1 0 01-1.414-1.414l5-5z" clipRule="evenodd" /></svg>;
const ListOrderedIcon = () => <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4a1 1 0 000 2h10a1 1 0 100-2H5zm0 4a1 1 0 100 2h10a1 1 0 100-2H5zm0 4a1 1 0 100 2h4a1 1 0 100-2H5z" clipRule="evenodd" /></svg>;
const ListBulletIcon = () => <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 5a1 1 0 000 2h10a1 1 0 100-2H5zm0 4a1 1 0 100 2h10a1 1 0 100-2H5zm0 4a1 1 0 100 2h4a1 1 0 100-2H5z" clipRule="evenodd" /></svg>;
const BoldIcon = () => <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4.5A2.5 2.5 0 016.5 2H10a2.5 2.5 0 012.5 2.5v.5a.5.5 0 001 0v-.5A3.5 3.5 0 0010 1H6.5A3.5 3.5 0 003 4.5v11A3.5 3.5 0 006.5 19H10a3.5 3.5 0 003.5-3.5v-.5a.5.5 0 00-1 0v.5a2.5 2.5 0 01-2.5 2.5H6.5A2.5 2.5 0 014 15.5v-11zm7.5 2a.5.5 0 000-1H9.062A1.5 1.5 0 007.562 7H7.5a.5.5 0 000 1h.062a1.5 1.5 0 001.438 1.5H11.5a.5.5 0 000-1H9.062A1.5 1.5 0 007.562 8H7.5a.5.5 0 000-1h.062A1.5 1.5 0 009.062 5.5H11.5z" clipRule="evenodd" /></svg>;

const NOTE_ID = "currentKigaNote";

export default function KigaNotePage() {
    const { user, loaded } = useUserStore(); // <<< user と loaded をストアから取得
    const router = useRouter();
    const [pageTitle, setPageTitle] = useState<string>("");
    const [pageContent, setPageContent] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true); // 初期状態はローディング中
    const [isSaving, setIsSaving] = useState(false);
    const [lastSavedToFirebase, setLastSavedToFirebase] = useState<Date | null>(null);


    const getLocalStorageKey = () => user ? `kigaNote_${user.uid}_${NOTE_ID}` : null;

    useEffect(() => {
        if (loaded && user) { // user情報が読み込み完了してから処理を開始
            const key = getLocalStorageKey();
            let loadedFromFirebase = false;
            if (key) {
                const savedTitle = localStorage.getItem(`${key}_title`);
                const savedContent = localStorage.getItem(`${key}_content`);
                if (savedTitle !== null) setPageTitle(savedTitle); // nullチェック追加
                if (savedContent !== null) setPageContent(savedContent);
                console.log("Loaded from localStorage:", { title: savedTitle, content: savedContent });

                if (savedTitle === null && savedContent === null) {
                    loadFromFirebase().then(() => loadedFromFirebase = true);
                } else {
                     setIsLoading(false); // localStorageから読み込めたらローディング終了
                }
            }
        } else if (loaded && !user) {
            // ユーザーがいないが、認証状態の確認は完了した場合
            setPageTitle("無題のページ (ログインしていません)");
            setPageContent("");
            setIsLoading(false);
        }
        // userストアのloadedがfalseのうちは何もしない（親のlayout.tsxで処理中）
    }, [user, loaded]); // user と loaded の変更を検知

    useEffect(() => {
        if (user && !isLoading) { // ローディングが完了してからlocalStorageに保存
            const key = getLocalStorageKey();
            if (key) {
                localStorage.setItem(`${key}_title`, pageTitle);
                localStorage.setItem(`${key}_content`, pageContent);
            }
        }
    }, [pageTitle, pageContent, user, isLoading]);

    const loadFromFirebase = async () => {
        if (!user) return;
        setIsLoading(true);
        toast.loading("ノートをFirebaseから読み込み中...", { id: "loading-note" });
        const notePath = `kigaNotes/${user.uid}/${NOTE_ID}.txt`;
        const storageRef = ref(storage, notePath);

        try {
            const bytes = await getBytes(storageRef);
            const decoder = new TextDecoder('utf-8');
            const fullNoteText = decoder.decode(bytes);

            const titleEndIndex = fullNoteText.indexOf('\n');
            if (titleEndIndex !== -1) {
                const loadedTitle = fullNoteText.substring(0, titleEndIndex);
                const loadedContent = fullNoteText.substring(titleEndIndex + 1);
                setPageTitle(loadedTitle);
                setPageContent(loadedContent);
                toast.success("Firebaseからノートを読み込みました", { id: "loading-note" });
                console.log("Loaded from Firebase");
            } else {
                setPageContent(fullNoteText);
                setPageTitle("無題のページ (Firebase)");
                toast.success("Firebaseからノートを読み込みました (タイトルなし)", { id: "loading-note" });
            }
        } catch (error: any) {
            if (error.code === 'storage/object-not-found') {
                console.log("No note found in Firebase for this user/note.");
                toast.dismiss("loading-note");
                if (!localStorage.getItem(getLocalStorageKey() + '_title')) { // localStorageにもなければ新規
                    setPageTitle("無題のページ");
                    setPageContent("");
                }
            } else {
                console.error("Error loading note from Firebase:", error);
                toast.error("Firebaseからの読み込みに失敗しました", { id: "loading-note" });
            }
        } finally {
            setIsLoading(false);
        }
    };


    const handleSaveToFirebase = async () => {
        if (!user) {
            toast.error("ログインしていません。");
            return;
        }
        if (!pageTitle.trim() && !pageContent.trim()) {
            toast.error("保存する内容がありません。");
            return;
        }

        setIsSaving(true);
        toast.loading("Firebaseに保存中...", { id: "saving-note" });

        const notePath = `kigaNotes/${user.uid}/${NOTE_ID}.txt`;
        const storageRef = ref(storage, notePath);
        const fullNoteText = `${pageTitle}\n${pageContent}`;

        try {
            await uploadString(storageRef, fullNoteText, 'raw');
            setLastSavedToFirebase(new Date());
            toast.success("ノートをFirebaseに保存しました！ 🎉", { id: "saving-note" });
            console.log("Saved to Firebase");
        } catch (error) {
            console.error("Error saving note to Firebase:", error);
            toast.error("Firebaseへの保存に失敗しました。", { id: "saving-note" });
        } finally {
            setIsSaving(false);
        }
    };


    const scrollToKigaApps = () => {
        router.push('/dashboard#kiga-applications-section');
    };

    // 親レイアウトでloadedのチェックは行われるが、念のためここでも
    if (!loaded) {
        return (
            <div className="flex h-screen items-center justify-center dark:bg-[#0F172A] text-white text-lg">
                読み込み中...
            </div>
        );
    }
    if (!user) {
        return (
             <div className="flex h-screen items-center justify-center dark:bg-[#0F172A] text-white text-lg">
                KigaNoteを使用するにはログインしてください。 <Link href="/login" className="ml-2 text-pink-400 hover:underline">ログインページへ</Link>
            </div>
        );
    }


    return (
        <div className="flex h-screen antialiased dark">
            {/* Left Sidebar (変更なし) */}
            <aside className="w-64 bg-gradient-to-b from-purple-600 to-pink-600 text-white p-5 flex flex-col shadow-2xl">
                <div className="flex items-center mb-6 pt-2">
                    <KigaLogoIcon />
                    <div>
                        <span className="text-xl font-bold tracking-tight">Kiga Workspace</span>
                        <p className="text-xs text-purple-200 opacity-90 font-medium">
                            Key Intelligence Gateway for Advancement
                        </p>
                    </div>
                </div>

                <div className="border-t border-white/20 my-4"></div>

                <nav className="space-y-1">
                    <Link href="/dashboard"
                        className="flex items-center py-2.5 px-3 rounded-lg transition duration-200 hover:bg-white/10"
                    >
                        <span className="text-sm font-medium">ダッシュボード</span>
                    </Link>
                </nav>

                <div className="border-t border-white/20 my-4"></div>

                <div className="space-y-2">
                    <h3 className="px-3 text-xs font-semibold text-purple-200 uppercase tracking-wider">KigaNote</h3>
                    <span
                        className="flex items-center py-2.5 px-3 rounded-lg bg-white/20 cursor-default"
                    >
                        <span className="text-sm font-medium truncate">{isLoading ? "読込中..." : (pageTitle || "現在のページ")}</span>
                    </span>
                    <button
                        className="flex w-full items-center py-2.5 px-3 rounded-lg transition duration-200 hover:bg-white/10 text-left"
                        onClick={() => {
                            setPageTitle("無題の新規ページ");
                            setPageContent("");
                            toast.success("新規ページを作成しました。");
                        }}
                    >
                        <span className="text-sm font-medium">新規ページ作成</span>
                    </button>
                </div>


                <div className="mt-auto">
                     <button
                        onClick={scrollToKigaApps}
                        className="flex w-full items-center py-2.5 px-3 rounded-lg transition duration-200 hover:bg-white/10 text-left"
                    >
                        <Squares2X2Icon />
                        <span className="text-sm font-medium">アプリ一覧へ</span>
                    </button>
                    <div className="border-t border-white/20 my-4"></div>
                    <div className="pb-2">
                       <p className="text-xs text-center text-purple-200 opacity-70">© 2024 Kiga Workspace</p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area for KigaNote */}
            <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-[#0F172A] p-6 md:p-10">
                <div className="flex justify-between items-center mb-6">
                    <input
                        type="text"
                        value={pageTitle}
                        onChange={(e) => setPageTitle(e.target.value)}
                        placeholder="無題のページ"
                        className="w-full text-3xl md:text-4xl font-bold bg-transparent dark:text-gray-100 focus:outline-none pb-2 border-b border-transparent dark:focus:border-slate-600 focus:border-slate-300 flex-grow"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSaveToFirebase}
                        disabled={isSaving || isLoading}
                        className="ml-4 flex items-center bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
                    >
                        <SaveIcon />
                        {isSaving ? "保存中..." : "Firebaseに保存"}
                    </button>
                </div>
                {lastSavedToFirebase && (
                    <p className="text-xs text-gray-400 dark:text-slate-500 mb-4 text-right">
                        最終Firebase保存: {lastSavedToFirebase.toLocaleString()}
                    </p>
                )}


                <div className="flex items-center space-x-2 mb-4 p-2 bg-white dark:bg-[#1E293B] rounded-lg shadow border dark:border-slate-700">
                    <button className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 dark:text-gray-300" title="見出し1"><TypeIcon /></button>
                    <button className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 dark:text-gray-300" title="番号付きリスト"><ListOrderedIcon /></button>
                    <button className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 dark:text-gray-300" title="箇条書きリスト"><ListBulletIcon /></button>
                    <button className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 dark:text-gray-300" title="太字"><BoldIcon /></button>
                </div>

                <div className="bg-white dark:bg-[#1E293B] p-6 rounded-lg shadow border dark:border-slate-700 min-h-[60vh]">
                    <textarea
                        value={pageContent}
                        onChange={(e) => setPageContent(e.target.value)}
                        placeholder="ここに入力してください..."
                        className="w-full h-full min-h-[50vh] p-0 bg-transparent focus:outline-none resize-none dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500"
                        disabled={isLoading}
                    />
                </div>
            </main>

            {/* Right Sidebar */}
            <aside className="w-16 bg-slate-100 dark:bg-[#0F172A] p-3 flex flex-col items-center space-y-5 shadow-lg border-l dark:border-slate-700">
                 <button className="p-2 mt-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none transition-colors duration-200">
                    <BellIcon />
                </button>
                {/* ユーザーアイコン表示部分を修正 */}
                <button
                    onClick={() => router.push('/dashboard/profile')}
                    className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 flex items-center justify-center"
                    title={user?.name || "プロフィール"}
                >
                    {user?.photoURL ? (
                        <img
                            src={user.photoURL}
                            alt={user.name || "User"}
                            className="w-full h-full object-cover"
                            onError={(e) => { // 画像読み込みエラー時のフォールバック
                                const target = e.target as HTMLImageElement;
                                target.onerror = null; // 無限ループを防ぐ
                                target.src = '/default-icon.png'; // プロジェクトのpublicフォルダに配置
                                target.alt = user.name?.charAt(0) || "?";
                            }}
                        />
                    ) : (
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                            {user?.name?.charAt(0).toUpperCase() || "?"}
                        </span>
                    )}
                </button>
            </aside>
        </div>
    );
}