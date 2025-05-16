// app/dashboard/KigaNote/page.tsx
"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { auth, db, storage } from "@/lib/firebase";
import { ref, uploadString, getDownloadURL, getBytes, deleteObject } from "firebase/storage";
import { collection, query, getDocs, doc, setDoc, deleteDoc, orderBy, serverTimestamp, Timestamp } from "firebase/firestore";
import { useUserStore } from "@/store/user";
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';

import Toolbar from './Toolbar';

// Firebase Storage path (lowercase k as per user's update)
const KIGA_NOTES_STORAGE_PATH = "kigaNotes";

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
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 15.75V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
    </svg>
);
const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);
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

const emptyContentJson = { type: "doc", content: [{ type: "paragraph" }] };

function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
}

export default function KigaNotePage() {
    const { user, loaded } = useUserStore();
    const router = useRouter();

    const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
    const [pageTitle, setPageTitle] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isNoteLoading, setIsNoteLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [lastSavedToFirebase, setLastSavedToFirebase] = useState<Date | null>(null);
    const [notesList, setNotesList] = useState<NoteMeta[]>([]);
    const isMounted = useRef(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
            Underline,
            Placeholder.configure({ placeholder: 'ここに入力してください...' }),
            LinkExtension.configure({ openOnClick: true, autolink: true, linkOnPaste: true }),
            ImageExtension,
            TextStyle, Color,
            Highlight.configure({ multicolor: true }),
            Typography,
        ],
        content: '', 
        editable: false,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            if (user && currentNoteId && !isNoteLoading && !isSaving && !isDeleting && isMounted.current && editor.isEditable) {
                const key = getLocalStorageKey(currentNoteId);
                if (key) {
                    localStorage.setItem(`${key}_title`, pageTitleRef.current);
                    localStorage.setItem(`${key}_content_json`, JSON.stringify(editor.getJSON()));
                }
                debounceUpdateFirestoreMeta(currentNoteId, pageTitleRef.current);
            }
        },
    });

    const pageTitleRef = useRef(pageTitle);
    useEffect(() => { pageTitleRef.current = pageTitle; }, [pageTitle]);

    const getLocalStorageKey = (noteId: string) => user ? `kigaNote_${user.uid}_${noteId}` : null;

    const debounceUpdateFirestoreMeta = useCallback(
        debounce(async (noteId: string, titleToSave: string) => {
            if (!user || !noteId || !isMounted.current) return;
            // console.log(`Debounced: Updating Firestore meta for ${noteId} with title: ${titleToSave}`);
            const noteMetaRef = doc(db, "users", user.uid, "kigaNotes", noteId);
            try {
                await setDoc(noteMetaRef, { title: titleToSave, lastModified: serverTimestamp() }, { merge: true });
            } catch (err) {
                console.error("Error updating note meta in Firestore (debounced):", err);
            }
        }, 1500),
        [user] 
    );
    
    useEffect(() => {
        if (user && currentNoteId && !isNoteLoading && !isSaving && !isDeleting && isMounted.current && editor?.isEditable) {
            const key = getLocalStorageKey(currentNoteId);
            if (key) {
                localStorage.setItem(`${key}_title`, pageTitle);
            }
            setNotesList(prevList =>
                prevList.map(note =>
                    note.id === currentNoteId ? { ...note, title: pageTitle } : note
                )
            );
            debounceUpdateFirestoreMeta(currentNoteId, pageTitle);
        }
    }, [pageTitle, currentNoteId, user, isNoteLoading, isSaving, isDeleting, editor, debounceUpdateFirestoreMeta]);


    const fetchNotesList = useCallback(async (selectLastOpened = true) => {
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

            if (fetchedNotes.length > 0) {
                if (selectLastOpened) {
                    const lastOpened = localStorage.getItem(`kigaNote_${user.uid}_lastOpened`);
                    const idToLoad = lastOpened && fetchedNotes.find(n => n.id === lastOpened) ? lastOpened : fetchedNotes[0].id;
                    if (currentNoteId !== idToLoad) setCurrentNoteId(idToLoad);
                    else if (currentNoteId === idToLoad && editor && !editor.isFocused) { 
                        loadNoteData(idToLoad);
                    }
                }
            } else {
                await handleCreateNewPage(true); 
            }
        } catch (error) {
            console.error("Error fetching notes list:", error);
            toast.error("ノートリストの取得に失敗しました。");
        } finally {
            setIsLoading(false);
        }
    }, [user, editor, currentNoteId]); 

    useEffect(() => {
        isMounted.current = true;
        if (loaded && user) {
            fetchNotesList();
        } else if (loaded && !user) {
            setIsLoading(false); setNotesList([]); setCurrentNoteId(null); setPageTitle("ログインしていません");
            if (editor) {
                editor.commands.setContent(emptyContentJson, false);
                editor.setEditable(false);
            }
        }
        return () => { isMounted.current = false; };
    }, [user, loaded, editor, fetchNotesList]);

    useEffect(() => {
        if (user && currentNoteId && editor && isMounted.current) {
            loadNoteData(currentNoteId);
            localStorage.setItem(`kigaNote_${user.uid}_lastOpened`, currentNoteId);
        } else if (!currentNoteId && editor && isMounted.current) {
            setPageTitle("");
            editor.commands.setContent(emptyContentJson, false);
            editor.setEditable(false);
        }
    }, [currentNoteId, user, editor]); 


    const loadNoteData = async (noteId: string) => {
        if (!user || !editor || !isMounted.current) return;

        setIsNoteLoading(true);
        editor.setEditable(false); 

        const key = getLocalStorageKey(noteId);
        let localTitle: string | null = null;
        let localContentJsonString: string | null = null;
        if (key) {
            localTitle = localStorage.getItem(`${key}_title`);
            localContentJsonString = localStorage.getItem(`${key}_content_json`);
        }

        const noteMeta = notesList.find(n => n.id === noteId);
        const titleToSet = localTitle || noteMeta?.title || "無題のページ";
        setPageTitle(titleToSet);

        if (localContentJsonString) {
            try {
                editor.commands.setContent(JSON.parse(localContentJsonString), false);
                setIsNoteLoading(false); editor.setEditable(true); editor.commands.focus(); return;
            } catch (e) { console.warn(`Failed to parse local content JSON for ${noteId}, will try Firebase.`, e); }
        } else {
            editor.commands.setContent(emptyContentJson, false);
        }

        const notePath = `${KIGA_NOTES_STORAGE_PATH}/${user.uid}/${noteId}.json`;
        const storageRef = ref(storage, notePath);
        try {
            const bytes = await getBytes(storageRef);
            const decoder = new TextDecoder('utf-8');
            const contentJsonStringFromFirebase = decoder.decode(bytes);
            const contentJson = JSON.parse(contentJsonStringFromFirebase);
            editor.commands.setContent(contentJson, false);
            if (key) {
                localStorage.setItem(`${key}_content_json`, contentJsonStringFromFirebase);
                if (!localTitle) localStorage.setItem(`${key}_title`, titleToSet);
            }
            setLastSavedToFirebase(new Date());
        } catch (error: any) {
            if (error.code === 'storage/object-not-found') {
                if (key && !localContentJsonString) { 
                    localStorage.setItem(`${key}_content_json`, JSON.stringify(emptyContentJson));
                    if (!localTitle) localStorage.setItem(`${key}_title`, titleToSet);
                }
            } else {
                console.error(`Error loading note ${noteId} content from Firebase:`, error);
                toast.error(`ノート「${titleToSet}」の読み込みに失敗: ${error.message || error}`);
            }
        } finally {
            setIsNoteLoading(false); editor.setEditable(true); editor.commands.focus();
        }
    };


    const handleSaveToFirebase = async () => {
        if (!user || !currentNoteId || !editor || !editor.isEditable) { toast.error("保存できません。"); return; }
        const currentContentJson = editor.getJSON();
        const currentTitle = pageTitleRef.current;
        if (!currentTitle.trim() && editor.isEmpty) { toast.error("保存する内容がありません。"); return; }

        setIsSaving(true);
        const savingToastId = toast.loading(`ノート「${currentTitle}」をFirebaseに保存中...`);
        const notePath = `${KIGA_NOTES_STORAGE_PATH}/${user.uid}/${currentNoteId}.json`;
        const storageRef = ref(storage, notePath);
        const contentJsonString = JSON.stringify(currentContentJson);

        try {
            await uploadString(storageRef, contentJsonString, 'raw', { contentType: 'application/json' });
            const noteMetaRef = doc(db, "users", user.uid, "kigaNotes", currentNoteId);
            await setDoc(noteMetaRef, { title: currentTitle, lastModified: serverTimestamp() }, { merge: true });
            setLastSavedToFirebase(new Date());
            setNotesList(prev => prev.map(n => n.id === currentNoteId ? {...n, lastModified: Timestamp.now() } : n)
                .sort((a,b) => (b.lastModified?.toMillis() || 0) - (a.lastModified?.toMillis() || 0) ));
            toast.success(`ノート「${currentTitle}」をFirebaseに保存しました！ 🎉`, { id: savingToastId });
        } catch (error: any) {
            console.error(`Error saving note ${currentNoteId} to Firebase:`, error);
            toast.error(`ノート「${currentTitle}」の保存失敗: ${error.message || '不明なエラー'}`, { id: savingToastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleCreateNewPage = useCallback(async (isInitialSetup = false) => {
        if (!user || !editor) return;

        setIsNoteLoading(true); 
        editor.setEditable(false);

        const newNoteId = uuidv4();
        const newTitle = "無題のページ";
        const newNoteMetaForState: NoteMeta = { id: newNoteId, title: newTitle, lastModified: Timestamp.now() };
        const newContentJsonString = JSON.stringify(emptyContentJson);

        let toastId: string | undefined;
        if (!isInitialSetup) {
            toastId = toast.loading("新しいノートを作成中...");
        }

        try {
            const noteMetaRef = doc(db, "users", user.uid, "kigaNotes", newNoteId);
            await setDoc(noteMetaRef, { title: newTitle, lastModified: serverTimestamp() });

            const notePath = `${KIGA_NOTES_STORAGE_PATH}/${user.uid}/${newNoteId}.json`;
            const storageRef = ref(storage, notePath);
            await uploadString(storageRef, newContentJsonString, 'raw', { contentType: 'application/json' });
            
            setNotesList(prev => [newNoteMetaForState, ...prev].sort((a, b) => (b.lastModified?.toMillis() || 0) - (a.lastModified?.toMillis() || 0)));
            
            const key = getLocalStorageKey(newNoteId);
            if (key) {
                localStorage.setItem(`${key}_title`, newTitle);
                localStorage.setItem(`${key}_content_json`, newContentJsonString);
            }
            localStorage.setItem(`kigaNote_${user.uid}_lastOpened`, newNoteId);

            setPageTitle(newTitle);
            editor.commands.setContent(emptyContentJson, false); 
            setCurrentNoteId(newNoteId); 

            setLastSavedToFirebase(null);

            if (!isInitialSetup && toastId) {
                toast.success("新しいノートを作成しました。", { id: toastId });
            }
        } catch (error: any) {
            console.error("Error creating new note:", error);
            const errorMsg = `新規ノート作成失敗: ${error.message || '不明なエラー'}`;
            if (toastId) toast.error(errorMsg, { id: toastId });
            else toast.error(errorMsg);
        } finally {
            editor.setEditable(true);
            editor.commands.focus();
            setIsNoteLoading(false);
        }
    }, [user, editor, getLocalStorageKey]); 


    const handleDeleteNote = async () => {
        if (!user || !currentNoteId || !editor) {
            toast.error("削除対象のノートが選択されていません。");
            return;
        }
        
        const noteToDelete = notesList.find(n => n.id === currentNoteId);
        if (!noteToDelete) {
            toast.error("削除対象のノートが見つかりません。"); 
            return;
        }

        if (notesList.length <= 1) {
            toast.error("最後のノートは削除できません。新しいノートを作成してから削除してください。");
            return;
        }

        if (!window.confirm(`ノート「${noteToDelete.title}」を削除しますか？この操作は元に戻せません。`)) {
            return;
        }

        setIsDeleting(true);
        const deletingToastId = toast.loading(`ノート「${noteToDelete.title}」を削除中...`);

        try {
            const noteMetaRef = doc(db, "users", user.uid, "kigaNotes", currentNoteId);
            await deleteDoc(noteMetaRef);

            const notePath = `${KIGA_NOTES_STORAGE_PATH}/${user.uid}/${currentNoteId}.json`;
            const storageFileRef = ref(storage, notePath);
            try {
                await deleteObject(storageFileRef);
            } catch (storageError: any) {
                if (storageError.code === 'storage/object-not-found') {
                    console.warn(`Storage file for note ${currentNoteId} not found, but proceeding with meta deletion.`);
                } else {
                    console.error("Error deleting storage file:", storageError);
                }
            }

            const localStorageKey = getLocalStorageKey(currentNoteId);
            if (localStorageKey) {
                localStorage.removeItem(`${localStorageKey}_title`);
                localStorage.removeItem(`${localStorageKey}_content_json`);
            }
            
            const deletedNoteId = currentNoteId; 
            const oldNotesList = [...notesList]; 
            const updatedNotesList = oldNotesList.filter(note => note.id !== deletedNoteId);
            setNotesList(updatedNotesList); 

            toast.success(`ノート「${noteToDelete.title}」を削除しました。`, { id: deletingToastId });

            if (updatedNotesList.length > 0) {
                const deletedNoteIndex = oldNotesList.findIndex(n => n.id === deletedNoteId);
                let nextNoteIdToSelect;
                if (deletedNoteIndex >= updatedNotesList.length) { 
                    nextNoteIdToSelect = updatedNotesList[updatedNotesList.length - 1].id;
                } else { 
                    nextNoteIdToSelect = updatedNotesList[Math.max(0, deletedNoteIndex)].id;
                }
                setCurrentNoteId(nextNoteIdToSelect); 
            } else {
                setCurrentNoteId(null); 
            }
            setLastSavedToFirebase(null);

        } catch (error: any) {
            console.error("Error deleting note:", error);
            toast.error(`ノート「${noteToDelete.title}」の削除失敗: ${error.message || '不明なエラー'}`, { id: deletingToastId });
        } finally {
            setIsDeleting(false);
        }
    };

    const selectNote = (noteId: string) => {
        if (noteId !== currentNoteId && !isNoteLoading && !isSaving && !isDeleting) {
            setCurrentNoteId(noteId);
        }
    };

    const scrollToKigaApps = () => { router.push('/dashboard#kiga-applications-section'); };

    useEffect(() => { return () => { editor?.destroy(); }; }, [editor]);

    if (!loaded || (isLoading && !user)) { 
        return (
            <div className="flex h-screen items-center justify-center dark:bg-[#0F172A] text-gray-500 dark:text-gray-400">
                ワークスペースを読み込み中...
            </div>
        );
    }
    if (!user && loaded) { 
         return (
            <div className="flex h-screen antialiased dark">
                <aside className="w-64 bg-gradient-to-b from-purple-600 to-pink-600 text-white p-5 flex flex-col shadow-2xl">
                    <div className="flex items-center mb-6 pt-2"> <KigaLogoIcon /> <div> <span className="text-xl font-bold tracking-tight">Kiga Workspace</span> <p className="text-xs text-purple-200 opacity-90 font-medium"> Key Intelligence Gateway for Advancement </p> </div> </div>
                    <div className="border-t border-white/20 my-4"></div>
                    <nav className="space-y-1"> <Link href="/dashboard" className="flex items-center py-2.5 px-3 rounded-lg transition duration-200 hover:bg-white/10" > <span className="text-sm font-medium">ダッシュボード</span> </Link> </nav>
                    <div className="border-t border-white/20 my-4"></div>
                    <div className="space-y-1 flex-grow overflow-y-auto pr-1">
                        <h3 className="px-3 pt-2 pb-1 text-xs font-semibold text-purple-200 uppercase tracking-wider">KIGANOTE</h3>
                        <p className="px-3 text-sm text-purple-200 opacity-70">ログインしてください</p>
                    </div>
                    <div className="mt-auto pt-2">
                         <button onClick={scrollToKigaApps} className="flex w-full items-center py-2.5 px-3 rounded-lg transition duration-200 hover:bg-white/10 dark:hover:bg-white/20 text-left" >
                            <Squares2X2Icon /> <span className="text-sm font-medium">アプリ一覧へ</span>
                        </button>
                        <div className="border-t border-white/20 my-4"></div> <div className="pb-2"> <p className="text-xs text-center text-purple-200 opacity-70">© 2024 Kiga Workspace</p> </div>
                    </div>
                </aside>
                <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-[#0F172A] p-6 md:p-10 flex items-center justify-center">
                    <p className="text-xl text-gray-500 dark:text-gray-400">KigaNoteを利用するにはログインしてください。</p>
                </main>
                <aside className="w-16 bg-slate-100 dark:bg-[#0F172A] p-3 flex flex-col items-center space-y-5 shadow-lg border-l dark:border-slate-700">
                </aside>
            </div>
        );
    }

    return (
        <div className="flex h-screen antialiased dark">
            <aside className="w-64 bg-gradient-to-b from-purple-600 to-pink-600 text-white p-5 flex flex-col shadow-2xl">
                <div className="flex items-center mb-6 pt-2"> <KigaLogoIcon /> <div> <span className="text-xl font-bold tracking-tight">Kiga Workspace</span> <p className="text-xs text-purple-200 opacity-90 font-medium"> Key Intelligence Gateway for Advancement </p> </div> </div>
                <div className="border-t border-white/20 my-4"></div>
                <nav className="space-y-1"> <Link href="/dashboard" className="flex items-center py-2.5 px-3 rounded-lg transition duration-200 hover:bg-white/10" > <span className="text-sm font-medium">ダッシュボード</span> </Link> </nav>
                <div className="border-t border-white/20 my-4"></div>
                <div className="space-y-1 flex-grow overflow-y-auto pr-1">
                    <h3 className="px-3 pt-2 pb-1 text-xs font-semibold text-purple-200 uppercase tracking-wider">KIGANOTE</h3>
                    {isLoading && notesList.length === 0 && ( <p className="px-3 text-sm text-purple-200 opacity-70">ノートリスト読込中...</p> )}
                    {!isLoading && notesList.length === 0 && user && ( <p className="px-3 text-sm text-purple-200 opacity-70">ノートはありません。</p> )}

                    {notesList.map(note => (
                        <button key={note.id} onClick={() => selectNote(note.id)}
                            disabled={isNoteLoading || isDeleting}
                            className={`flex w-full items-center py-2 px-3 rounded-lg transition duration-200 text-left truncate ${ currentNoteId === note.id ? 'bg-white/25' : 'hover:bg-white/10' } ${isNoteLoading || isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={note.title} >
                            <span className="text-sm font-medium">{note.title || "無題"}</span>
                        </button>
                    ))}
                </div>
                 <button className="flex w-full items-center py-2.5 px-3 mt-2 rounded-lg transition duration-200 hover:bg-white/10 text-left border-t border-white/10"
                    onClick={() => handleCreateNewPage()}
                    disabled={isSaving || isDeleting || isNoteLoading} >
                    <span className="text-sm font-medium">＋ 新規ページ作成</span>
                </button>
                <div className="mt-auto pt-2">
                     <button onClick={scrollToKigaApps} className="flex w-full items-center py-2.5 px-3 rounded-lg transition duration-200 hover:bg-white/10 dark:hover:bg-white/20 text-left" >
                        <Squares2X2Icon /> <span className="text-sm font-medium">アプリ一覧へ</span>
                    </button>
                    <div className="border-t border-white/20 my-4"></div> <div className="pb-2"> <p className="text-xs text-center text-purple-200 opacity-70">© 2024 Kiga Workspace</p> </div>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-[#0F172A] p-6 md:p-10">
                {(isNoteLoading || (isLoading && currentNoteId)) &&  (
                     <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
                        ノートを読み込み中...
                    </div>
                )}
                {editor && !isNoteLoading && !isLoading && currentNoteId && ( 
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <input type="text" value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} placeholder="無題のページ"
                                className="w-full text-3xl md:text-4xl font-bold bg-transparent dark:text-gray-100 focus:outline-none pb-2 border-b border-transparent dark:focus:border-slate-600 focus:border-slate-300 flex-grow"
                                disabled={isSaving || isDeleting || !editor?.isEditable } />
                            <div className="flex items-center ml-4">
                                <button onClick={handleDeleteNote}
                                    disabled={isSaving || isDeleting || !editor?.isEditable || notesList.length <= 1 }
                                    className="mr-2 flex items-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition duration-200 disabled:opacity-50"
                                    title="現在のノートを削除" >
                                    <TrashIcon /> {isDeleting && <span className="ml-1 text-xs">削除中</span>}
                                </button>
                                <button onClick={handleSaveToFirebase}
                                    disabled={isSaving || isDeleting || !editor?.isEditable }
                                    className="flex items-center bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50" >
                                    <SaveIcon /> {isSaving ? "保存中..." : "Firebaseに保存"}
                                </button>
                            </div>
                        </div>
                        {lastSavedToFirebase && ( <p className="text-xs text-gray-400 dark:text-slate-500 mb-4 text-right"> 最終Firebase保存: {lastSavedToFirebase.toLocaleString()} </p> )}
                        <Toolbar editor={editor} />
                        <div className="bg-white dark:bg-[#1E293B] p-1 rounded-lg shadow border dark:border-slate-700 ">
                            <EditorContent editor={editor} className="min-h-[60vh] prose dark:prose-invert max-w-none p-4 focus:outline-none" />
                        </div>
                    </>
                )}
                 {editor && !isNoteLoading && !isLoading && !currentNoteId && notesList.length === 0 && ( 
                    <div className="flex h-full flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <p className="text-xl mb-4">ノートがありません。</p>
                        <button
                            onClick={() => handleCreateNewPage()}
                            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                        >
                            最初のノートを作成する
                        </button>
                    </div>
                )}
            </main>

            <aside className="w-16 bg-slate-100 dark:bg-[#0F172A] p-3 flex flex-col items-center space-y-5 shadow-lg border-l dark:border-slate-700"> <button className="p-2 mt-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none transition-colors duration-200"> <BellIcon /> </button> <button onClick={() => router.push('/dashboard/profile')} className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 flex items-center justify-center" title={user?.name || "プロフィール"} > {user?.photoURL ? ( <img src={user.photoURL} alt={user.name || "User"} className="w-full h-full object-cover" onError={(e) => { const target = e.target as HTMLImageElement; target.onerror = null; target.src = '/default-icon.png'; target.alt = user.name?.charAt(0) || "?"; }} /> ) : ( <span className="text-sm font-bold text-gray-600 dark:text-gray-300"> {user?.name?.charAt(0).toUpperCase() || "?"} </span> )} </button> </aside>
        </div>
    );
}