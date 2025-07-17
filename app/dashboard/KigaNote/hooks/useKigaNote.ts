// app/dashboard/KigaNote/hooks/useKigaNote.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { useUserStore, NoteMeta } from "@/store/user";
import { toast } from 'react-hot-toast';
import { Editor } from '@tiptap/react';
import { Timestamp } from "@/lib/firebase";
import { debounce } from '@/utils/debounce';
import * as kigaNoteService from '../services/kigaNoteService';

const emptyContentJson = { type: "doc", content: [{ type: "paragraph" }] };

export const useKigaNote = (editor: Editor | null) => {
    const { user, loaded, addNote: addNoteToStore } = useUserStore();

    const [notesList, setNotesList] = useState<NoteMeta[]>([]);
    const [currentNoteId, setCurrentNoteId] = useState<string | null>(null);
    const [pageTitle, setPageTitle] = useState<string>("");
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    
    const [isLoading, setIsLoading] = useState(true); // 全体の初期ロード
    const [isNoteLoading, setIsNoteLoading] = useState(false); // 個別ノートのロード
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const isMounted = useRef(false);
    const pageTitleRef = useRef(pageTitle);
    useEffect(() => { pageTitleRef.current = pageTitle; }, [pageTitle]);
    const notesListRef = useRef(notesList);
    useEffect(() => { notesListRef.current = notesList; }, [notesList]);


    const debounceUpdateMeta = useCallback(
        debounce(async (noteId: string, title: string) => {
            if (!user || !isMounted.current) return;
            try {
                await kigaNoteService.updateNoteMeta(user.uid, noteId, title);
            } catch (err) {
                console.error("Error updating note meta (debounced):", err);
                // ここではtoastは表示しない。ユーザー操作を妨げないため。
            }
        }, 1500),
        [user]
    );

    const handleEditorUpdate = useCallback(() => {
        if (user && currentNoteId && editor && editor.isEditable && !isNoteLoading && !isSaving && !isDeleting && isMounted.current) {
            kigaNoteService.setCachedTitle(user.uid, currentNoteId, pageTitleRef.current);
            kigaNoteService.setCachedContent(user.uid, currentNoteId, editor.getJSON());
            debounceUpdateMeta(currentNoteId, pageTitleRef.current);
        }
    }, [user, currentNoteId, editor, isNoteLoading, isSaving, isDeleting, debounceUpdateMeta]);

    const loadNote = useCallback(async (noteId: string) => {
        if (!user || !editor) return;

        setIsNoteLoading(true);
        editor.setEditable(false);

        try {
            // 1. キャッシュから取得試行
            const cachedTitle = kigaNoteService.getCachedTitle(user.uid, noteId);
            const cachedContent = kigaNoteService.getCachedContent(user.uid, noteId);
            const noteMeta = notesListRef.current.find(n => n.id === noteId);
            
            const titleToSet = cachedTitle || noteMeta?.title || "無題のページ";
            setPageTitle(titleToSet);

            if (cachedContent) {
                editor.commands.setContent(cachedContent, false);
            } else {
                // 2. キャッシュがなければFirebaseから取得
                editor.commands.setContent(emptyContentJson, false); // 一旦空にする
                const contentFromFirebase = await kigaNoteService.fetchNoteContent(user.uid, noteId);
                editor.commands.setContent(contentFromFirebase, false);
                // 取得後、キャッシュに保存
                kigaNoteService.setCachedContent(user.uid, noteId, contentFromFirebase);
                if (!cachedTitle) {
                    kigaNoteService.setCachedTitle(user.uid, noteId, titleToSet);
                }
            }
            setLastSaved(new Date()); // これはローカル/リモート問わずロード成功日時
            kigaNoteService.setLastOpenedNoteId(user.uid, noteId);

        } catch (error: any) {
            console.error(`Error loading note ${noteId}:`, error);
            toast.error(`ノートの読み込みに失敗しました: ${error.message}`);
        } finally {
            setIsNoteLoading(false);
            editor.setEditable(true);
            editor.commands.focus();
        }
    }, [user, editor]);

    const createNewPage = useCallback(async (isInitialSetup = false) => {
        if (!user || !editor) return null;

        setIsNoteLoading(true);
        editor.setEditable(false);
        
        const toastId = isInitialSetup ? undefined : toast.loading("新しいノートを作成中...");

        try {
            const newNote = await kigaNoteService.createNewNote(user.uid);
            
            addNoteToStore(newNote); // Zustandストアを更新
            setNotesList(prev => [newNote, ...prev].sort((a, b) => (b.lastModified?.toMillis() || 0) - (a.lastModified?.toMillis() || 0)));
            
            // 新しいノートのキャッシュを作成
            kigaNoteService.setCachedTitle(user.uid, newNote.id, newNote.title);
            kigaNoteService.setCachedContent(user.uid, newNote.id, emptyContentJson);
            
            if (toastId) toast.success("新しいノートを作成しました。", { id: toastId });
            
            return newNote.id;
        } catch (error: any) {
            console.error("Error creating new note:", error);
            const errorMsg = `新規ノート作成失敗: ${error.message || '不明なエラー'}`;
            if (toastId) toast.error(errorMsg, { id: toastId });
            else toast.error(errorMsg);
            return null;
        } finally {
            editor.setEditable(true);
            setIsNoteLoading(false);
        }
    }, [user, editor, addNoteToStore]);

    const handleCreateNewPage = async () => {
        const newNoteId = await createNewPage(false);
        if (newNoteId) {
            setCurrentNoteId(newNoteId);
        }
    };

    const handleSave = async () => {
        if (!user || !currentNoteId || !editor || !editor.isEditable) {
            toast.error("保存できません。");
            return;
        }
        const currentContent = editor.getJSON();
        const currentTitle = pageTitleRef.current;
        if (!currentTitle.trim() && editor.isEmpty) {
            toast.error("保存する内容がありません。");
            return;
        }

        setIsSaving(true);
        const toastId = toast.loading(`ノート「${currentTitle}」を保存中...`);

        try {
            await kigaNoteService.saveNote(user.uid, currentNoteId, currentTitle, currentContent);
            setLastSaved(new Date());
            // メタデータを更新してリストを再ソート
            setNotesList(prev => prev.map(n => n.id === currentNoteId ? { ...n, title: currentTitle, lastModified: Timestamp.now() } : n)
                .sort((a, b) => (b.lastModified?.toMillis() || 0) - (a.lastModified?.toMillis() || 0)));
            toast.success(`ノート「${currentTitle}」を保存しました！`, { id: toastId });
        } catch (error: any) {
            console.error(`Error saving note ${currentNoteId}:`, error);
            toast.error(`保存失敗: ${error.message}`, { id: toastId });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!user || !currentNoteId) return;
        
        const noteToDelete = notesList.find(n => n.id === currentNoteId);
        if (!noteToDelete) return;

        if (notesList.length <= 1) {
            toast.error("最後のノートは削除できません。");
            return;
        }

        if (!window.confirm(`ノート「${noteToDelete.title}」を削除しますか？`)) return;

        setIsDeleting(true);
        const toastId = toast.loading(`ノート「${noteToDelete.title}」を削除中...`);

        try {
            await kigaNoteService.deleteNote(user.uid, currentNoteId);
            kigaNoteService.removeCachedNote(user.uid, currentNoteId);

            const oldNotesList = [...notesList];
            const updatedNotes = oldNotesList.filter(n => n.id !== currentNoteId);
            setNotesList(updatedNotes);

            toast.success(`ノート「${noteToDelete.title}」を削除しました。`, { id: toastId });

            // 次のノートを選択
            const deletedIndex = oldNotesList.findIndex(n => n.id === currentNoteId);
            const nextIndex = Math.min(deletedIndex, updatedNotes.length - 1);
            const nextNoteId = updatedNotes[nextIndex]?.id || null;
            setCurrentNoteId(nextNoteId);

        } catch (error: any) {
            console.error("Error deleting note:", error);
            toast.error(`削除失敗: ${error.message}`, { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleSelectNote = (noteId: string) => {
        if (noteId !== currentNoteId && !isNoteLoading && !isSaving && !isDeleting) {
            setCurrentNoteId(noteId);
        }
    };

    // 初期データロード
    useEffect(() => {
        isMounted.current = true;
        const loadInitialData = async () => {
            if (!user || !loaded || !editor) return;

            setIsLoading(true);
            try {
                const notes = await kigaNoteService.fetchNotesList(user.uid);
                setNotesList(notes);

                if (notes.length > 0) {
                    const lastOpenedId = kigaNoteService.getLastOpenedNoteId(user.uid);
                    const idToLoad = lastOpenedId && notes.find(n => n.id === lastOpenedId) ? lastOpenedId : notes[0].id;
                    setCurrentNoteId(idToLoad);
                } else {
                    const newNoteId = await createNewPage(true);
                    if (newNoteId) {
                        setCurrentNoteId(newNoteId);
                    }
                }
            } catch (error: any) {
                console.error("Error fetching notes list:", error);
                toast.error("ノートリストの取得に失敗しました。");
            } finally {
                setIsLoading(false);
            }
        };

        if (loaded && user) {
            loadInitialData();
        } else if (loaded && !user) {
            setIsLoading(false);
            setNotesList([]);
            setCurrentNoteId(null);
            setPageTitle("ログインしていません");
            if (editor) {
                editor.commands.setContent(emptyContentJson, false);
                editor.setEditable(false);
            }
        }
        return () => { isMounted.current = false; };
    }, [user, loaded, editor, createNewPage]);

    // currentNoteIdが変更されたらノートをロード
    useEffect(() => {
        if (currentNoteId && user && editor && isMounted.current) {
            loadNote(currentNoteId);
        } else if (!currentNoteId && editor && isMounted.current) {
            setPageTitle("");
            editor.commands.setContent(emptyContentJson, false);
            editor.setEditable(false);
        }
    }, [currentNoteId, user, editor]); // loadNoteは依存配列から外す

    return {
        // 状態
        notesList,
        currentNoteId,
        pageTitle,
        lastSaved,
        isLoading,
        isNoteLoading,
        isSaving,
        isDeleting,
        user,
        loaded,

        // イベントハンドラ
        setPageTitle,
        handleSelectNote,
        handleCreateNewPage,
        handleSave,
        handleDelete,
        handleEditorUpdate,
    };
};
