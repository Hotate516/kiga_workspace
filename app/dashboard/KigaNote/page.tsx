// app/dashboard/KigaNote/page.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase";
import { ref, uploadString, getDownloadURL, getBytes, deleteObject } from "firebase/storage";
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, orderBy, serverTimestamp, Timestamp
} from "firebase/firestore";
import { useUserStore } from "@/store/user";
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

// アイコンコンポーネント
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
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);

interface NoteMeta {
    id: string;
    title: string;
    lastModified: Timestamp;
}

export default function KigaNotePage() {
    const { user, loaded } = useUserStore();
    const router = useRouter();

    const defaultInitialNoteId = "initial-default-note";
    const [currentNoteId, setCurrentNoteId] = useState<string>(defaultInitialNoteId);
    const [pageTitle, setPageTitle] = useState<string>("無題のページ");
    const [pageContent, setPageContent] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [lastSavedToFirebase, setLastSavedToFirebase] = useState<Date | null>(null);
    const [notesList, setNotesList] = useState<NoteMeta[]>([]);

    const pageTitleRef = useRef(pageTitle);
    const pageContentRef = useRef(pageContent);
    useEffect(() => { pageTitleRef.current = pageTitle; }, [pageTitle]);
    useEffect(() => { pageContentRef.current = pageContent; }, [pageContent]);

    const getLocalStorageKey = (noteId: string) => user ? `kigaNote_${user.uid}_${noteId}` : null;

    const fetchNotesList = useCallback(async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            const notesRef = collection(db, "users", user.uid, "kigaNotes");
            const q = query(notesRef, orderBy("lastModified", "desc"));
            const querySnapshot = await getDocs(q);
            const fetchedNotes: NoteMeta[] = [];
            querySnapshot.forEach((doc) => {
                fetchedNotes.push({ id: doc.id, ...doc.data() } as NoteMeta);
            });
            setNotesList(fetchedNotes);
            console.log("Fetched notes list:", fetchedNotes);

            if (fetchedNotes.length > 0 && currentNoteId === defaultInitialNoteId) {
                const lastOpened = localStorage.getItem(`kigaNote_${user.uid}_lastOpened`);
                const idToLoad = lastOpened && fetchedNotes.find(n => n.id === lastOpened) ? lastOpened : fetchedNotes[0].id;
                setCurrentNoteId(idToLoad);
            } else if (fetchedNotes.length === 0 && currentNoteId === defaultInitialNoteId) {
                await handleCreateNewPage(true); // await を追加
            } else {
                // currentNoteId が既に設定されている場合や、リストはあるが currentNoteId が defaultInitialNoteId でない場合は何もしない
                // (currentNoteId の useEffect が loadNoteData をトリガーする)
                 setIsLoading(false); // リスト取得完了でローディングを一旦解除
            }
        } catch (error) {
            console.error("Error fetching notes list:", error);
            toast.error("ノートリストの取得に失敗しました。");
            setIsLoading(false);
        }
    }, [user, currentNoteId]); // handleCreateNewPage を依存配列から削除（無限ループ回避）

    useEffect(() => {
        if (loaded && user) {
            fetchNotesList();
        } else if (loaded && !user) {
            setIsLoading(false);
            setNotesList([]);
            setPageTitle("ログインしていません");
            setPageContent("");
        }
    }, [user, loaded, fetchNotesList]);

    useEffect(() => {
        if (user && currentNoteId && currentNoteId !== defaultInitialNoteId) {
            loadNoteData(currentNoteId);
            localStorage.setItem(`kigaNote_${user.uid}_lastOpened`, currentNoteId);
        }
    }, [currentNoteId, user]); // userを依存配列に追加

    const loadNoteData = async (noteId: string) => {
        if (!user) return;
        setIsLoading(true);
        const key = getLocalStorageKey(noteId);
        let localTitle: string | null = null;
        let localContent: string | null = null;

        if (key) {
            localTitle = localStorage.getItem(`${key}_title`);
            localContent = localStorage.getItem(`${key}_content`);
        }
        const noteMeta = notesList.find(n => n.id === noteId);

        if (localTitle !== null || localContent !== null) {
            setPageTitle(localTitle || noteMeta?.title || "無題");
            setPageContent(localContent || "");
            console.log(`Loaded note ${noteId} from localStorage`);
            setIsLoading(false);
            return;
        }

        console.log(`Attempting to load note ${noteId} from Firebase`);
        toast.loading(`ノート「${noteMeta?.title || noteId}」をFirebaseから読み込み中...`, { id: `loading-${noteId}` });
        const notePath = `kigaNotes/${user.uid}/${noteId}.txt`;
        const storageRef = ref(storage, notePath);

        try {
            const bytes = await getBytes(storageRef);
            const decoder = new TextDecoder('utf-8');
            const fullNoteText = decoder.decode(bytes);
            const titleEndIndex = fullNoteText.indexOf('\n');
            let loadedTitle = noteMeta?.title || "無題 (Firebase)";
            let loadedContent = fullNoteText;

            if (titleEndIndex !== -1) {
                loadedTitle = fullNoteText.substring(0, titleEndIndex);
                loadedContent = fullNoteText.substring(titleEndIndex + 1);
            }
            setPageTitle(loadedTitle);
            setPageContent(loadedContent);

            if (key) {
                localStorage.setItem(`${key}_title`, loadedTitle);
                localStorage.setItem(`${key}_content`, loadedContent);
            }
            toast.success(`ノート「${loadedTitle}」をFirebaseから読み込みました`, { id: `loading-${noteId}` });
        } catch (error: any) {
            if (error.code === 'storage/object-not-found') {
                console.log(`Note ${noteId} not found in Firebase (and not in localStorage). Treating as new.`);
                toast.dismiss(`loading-${noteId}`);
                setPageTitle(noteMeta?.title || "無題の新規ページ");
                setPageContent("");
            } else {
                console.error(`Error loading note ${noteId} from Firebase:`, error);
                toast.error(`ノート「${noteMeta?.title || noteId}」の読み込みに失敗`, { id: `loading-${noteId}` });
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user && currentNoteId && !isLoading && !isSaving && !isDeleting) {
            const key = getLocalStorageKey(currentNoteId);
            if (key) {
                localStorage.setItem(`${key}_title`, pageTitle);
                localStorage.setItem(`${key}_content`, pageContent);
            }
            if (currentNoteId !== defaultInitialNoteId) { // デフォルトIDのノートはメタデータ更新しない
                const noteMetaRef = doc(db, "users", user.uid, "kigaNotes", currentNoteId);
                setDoc(noteMetaRef, { title: pageTitle, lastModified: serverTimestamp() }, { merge: true })
                    .catch(err => console.error("Error updating note meta in Firestore:", err));
            }
        }
    }, [pageTitle, pageContent, currentNoteId, user, isLoading, isSaving, isDeleting]);


    const handleSaveToFirebase = async () => {
        if (!user || !currentNoteId || currentNoteId === defaultInitialNoteId) {
            toast.error("保存対象のノートが正しく選択されていません。");
            return;
        }
        if (!pageTitle.trim() && !pageContent.trim()) {
            toast.error("保存する内容がありません。");
            return;
        }
        setIsSaving(true);
        toast.loading(`ノート「${pageTitle}」をFirebaseに保存中...`, { id: `saving-${currentNoteId}` });
        const notePath = `kigaNotes/${user.uid}/${currentNoteId}.txt`;
        const storageRef = ref(storage, notePath);
        const fullNoteText = `${pageTitle}\n${pageContent}`;

        try {
            await uploadString(storageRef, fullNoteText, 'raw');
            const noteMetaRef = doc(db, "users", user.uid, "kigaNotes", currentNoteId);
            const currentTimestamp = Timestamp.now(); //クライアントタイムスタンプでUI即時反映用
            await setDoc(noteMetaRef, { title: pageTitle, lastModified: serverTimestamp() }, { merge: true });
            setLastSavedToFirebase(new Date());
            setNotesList(prev => prev.map(n => n.id === currentNoteId ? {...n, title: pageTitle, lastModified: currentTimestamp } : n)
                .sort((a,b) => {
                    const timeA = a.lastModified?.toMillis ? a.lastModified.toMillis() : 0;
                    const timeB = b.lastModified?.toMillis ? b.lastModified.toMillis() : 0;
                    return timeB - timeA;
                }));
            toast.success(`ノート「${pageTitle}」をFirebaseに保存しました！ 🎉`, { id: `saving-${currentNoteId}` });
        } catch (error) {
            console.error(`Error saving note ${currentNoteId} to Firebase:`, error);
            toast.error(`ノート「${pageTitle}」のFirebase保存に失敗`, { id: `saving-${currentNoteId}` });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateNewPage = useCallback(async (isInitialSetup = false) => {
        if (!user) return;
        const newNoteId = uuidv4();
        const newTitle = "無題の新規ページ";

        const noteMetaRef = doc(db, "users", user.uid, "kigaNotes", newNoteId);
        const newNoteMetaForState: NoteMeta = { id: newNoteId, title: newTitle, lastModified: Timestamp.now() };
        try {
            await setDoc(noteMetaRef, { title: newTitle, lastModified: serverTimestamp() });

            setPageTitle(newTitle); // state更新
            setPageContent("");
            setCurrentNoteId(newNoteId); // これで loadNoteData がトリガーされる
            setLastSavedToFirebase(null);

            setNotesList(prev => [newNoteMetaForState, ...prev].sort((a, b) => {
                const timeA = a.lastModified?.toMillis ? a.lastModified.toMillis() : 0;
                const timeB = b.lastModified?.toMillis ? b.lastModified.toMillis() : 0;
                return timeB - timeA;
            }));

            localStorage.setItem(`kigaNote_${user.uid}_lastOpened`, newNoteId);
            const key = getLocalStorageKey(newNoteId);
            if (key) {
                localStorage.setItem(`${key}_title`, newTitle);
                localStorage.setItem(`${key}_content`, "");
            }
            if (!isInitialSetup) {
                toast.success("新しいノートを作成しました。");
            }
        } catch (error) {
            console.error("Error creating new note in Firestore:", error);
            toast.error("新規ノートの作成に失敗しました。");
        }
    }, [user, getLocalStorageKey]); // getLocalStorageKeyを依存配列に追加


    const handleDeleteNote = async () => {
        if (!user || !currentNoteId || currentNoteId === defaultInitialNoteId) {
            toast.error("削除対象のノートが特定できないか、初期状態のノートは削除できません。");
            return;
        }
        const noteToDelete = notesList.find(n => n.id === currentNoteId);
        const confirmDelete = window.confirm(`ノート「${noteToDelete?.title || "無題"}」を本当に削除しますか？この操作は元に戻せません。`);
        if (!confirmDelete) return;

        setIsDeleting(true);
        toast.loading(`ノート「${noteToDelete?.title}」を削除中...`, { id: `deleting-${currentNoteId}` });

        const notePath = `kigaNotes/${user.uid}/${currentNoteId}.txt`;
        const storageRef = ref(storage, notePath);
        try {
            await deleteObject(storageRef);
        } catch (error: any) {
            if (error.code !== 'storage/object-not-found') {
                console.error(`Error deleting note ${currentNoteId} from Firebase Storage:`, error);
                toast.error(`Firebaseからのノートファイル削除に失敗しました。`, { id: `deleting-${currentNoteId}` });
                setIsDeleting(false);
                return;
            }
        }
        const key = getLocalStorageKey(currentNoteId);
        if (key) {
            localStorage.removeItem(`${key}_title`);
            localStorage.removeItem(`${key}_content`);
        }
        const noteMetaRef = doc(db, "users", user.uid, "kigaNotes", currentNoteId);
        try {
            await deleteDoc(noteMetaRef);
        } catch (error) {
            console.error(`Error deleting note meta ${currentNoteId} from Firestore:`, error);
            toast.error(`Firestoreからのノート情報削除に失敗しました。`, { id: `deleting-${currentNoteId}` });
            // ストレージのファイルは消えたがメタデータが消せない場合、一貫性が崩れる可能性
            setIsDeleting(false);
            return;
        }

        toast.success(`ノート「${noteToDelete?.title}」を削除しました。`, { id: `deleting-${currentNoteId}` });
        const updatedNotesList = notesList.filter(note => note.id !== currentNoteId);
        setNotesList(updatedNotesList);

        if (updatedNotesList.length > 0) {
            setCurrentNoteId(updatedNotesList[0].id); // リストの最初のノートを開く
            localStorage.setItem(`kigaNote_${user.uid}_lastOpened`, updatedNotesList[0].id);
        } else {
            await handleCreateNewPage(true); // 全て削除されたら新規作成
        }
        setIsDeleting(false);
    };

    const selectNote = (noteId: string) => {
        if (noteId !== currentNoteId) {
            setCurrentNoteId(noteId);
        }
    };

    const scrollToKigaApps = () => {
        router.push('/dashboard#kiga-applications-section');
    };

    if (!loaded) {
        return (
            <div className="flex h-screen items-center justify-center dark:bg-[#0F172A] text-white text-lg">
                ワークスペースを読み込み中...
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
                <div className="space-y-1 flex-grow overflow-y-auto pr-1">
                    <h3 className="px-3 pt-2 pb-1 text-xs font-semibold text-purple-200 uppercase tracking-wider">KIGANOTE</h3>
                    {isLoading && notesList.length === 0 && ( // 初回リスト読み込み中
                         <p className="px-3 text-sm text-purple-200 opacity-70">ノートリスト読込中...</p>
                    )}
                    {!isLoading && notesList.length === 0 && (
                        <p className="px-3 text-sm text-purple-200 opacity-70">ノートはありません。</p>
                    )}
                    {notesList.map(note => (
                        <button
                            key={note.id}
                            onClick={() => selectNote(note.id)}
                            className={`flex w-full items-center py-2 px-3 rounded-lg transition duration-200 text-left truncate ${
                                currentNoteId === note.id ? 'bg-white/25' : 'hover:bg-white/10'
                            }`}
                            title={note.title}
                        >
                            <span className="text-sm font-medium">{note.title || "無題"}</span>
                        </button>
                    ))}
                </div>
                 <button
                    className="flex w-full items-center py-2.5 px-3 mt-2 rounded-lg transition duration-200 hover:bg-white/10 text-left border-t border-white/10"
                    onClick={() => handleCreateNewPage()} // isInitialSetupなしで呼ぶ
                >
                    <span className="text-sm font-medium">＋ 新規ページ作成</span>
                </button>
                <div className="mt-auto pt-2">
                     <button
                        onClick={scrollToKigaApps}
                        className="flex w-full items-center py-2.5 px-3 rounded-lg transition duration-200 hover:bg-white/10 dark:hover:bg-white/20 text-left"
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

            <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-[#0F172A] p-6 md:p-10">
                {isLoading && currentNoteId !== defaultInitialNoteId ? (
                     <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
                        ノート「{notesList.find(n=>n.id === currentNoteId)?.title || currentNoteId}」を読み込み中...
                    </div>
                ) : (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <input
                                type="text"
                                value={pageTitle}
                                onChange={(e) => setPageTitle(e.target.value)}
                                placeholder="無題のページ"
                                className="w-full text-3xl md:text-4xl font-bold bg-transparent dark:text-gray-100 focus:outline-none pb-2 border-b border-transparent dark:focus:border-slate-600 focus:border-slate-300 flex-grow"
                                disabled={isSaving || isDeleting || isLoading}
                            />
                            <div className="flex items-center ml-4">
                                <button
                                    onClick={handleDeleteNote}
                                    disabled={isSaving || isDeleting || isLoading || notesList.length < 1 || (notesList.length === 1 && currentNoteId === notesList[0]?.id) }
                                    className="mr-2 flex items-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition duration-200 disabled:opacity-50"
                                    title="現在のノートを削除"
                                >
                                    <TrashIcon />
                                    {isDeleting && <span className="ml-1 text-xs">削除中</span>}
                                </button>
                                <button
                                    onClick={handleSaveToFirebase}
                                    disabled={isSaving || isDeleting || isLoading}
                                    className="flex items-center bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
                                >
                                    <SaveIcon />
                                    {isSaving ? "保存中..." : "Firebaseに保存"}
                                </button>
                            </div>
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
                                disabled={isSaving || isDeleting || isLoading}
                            />
                        </div>
                    </>
                )}
            </main>

            <aside className="w-16 bg-slate-100 dark:bg-[#0F172A] p-3 flex flex-col items-center space-y-5 shadow-lg border-l dark:border-slate-700">
                 <button className="p-2 mt-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none transition-colors duration-200">
                    <BellIcon />
                </button>
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
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.onerror = null;
                                target.src = '/default-icon.png';
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