// app/dashboard/KigaNote/services/kigaNoteService.ts
import {
    db,
    storage,
    ref,
    uploadString,
    getBytes,
    deleteObject,
    collection,
    query,
    getDocs,
    doc,
    setDoc,
    deleteDoc,
    orderBy,
    serverTimestamp,
    Timestamp
} from "@/lib/firebase";
import { NoteMeta } from "@/store/user";
import { v4 as uuidv4 } from 'uuid';

const KIGA_NOTES_STORAGE_PATH = "kigaNotes";
const emptyContentJson = { type: "doc", content: [{ type: "paragraph" }] };

/**
 * Firestoreからノートのメタデータリストを取得します。
 * @param uid ユーザーID
 * @returns ノートメタデータの配列
 */
export const fetchNotesList = async (uid: string): Promise<NoteMeta[]> => {
    const notesRef = collection(db, "users", uid, "kigaNotes");
    const q = query(notesRef, orderBy("lastModified", "desc"));
    const querySnapshot = await getDocs(q);
    const fetchedNotes: NoteMeta[] = [];
    querySnapshot.forEach((doc) => {
        fetchedNotes.push({ id: doc.id, ...doc.data() } as NoteMeta);
    });
    return fetchedNotes;
};

/**
 * Firebase Storageからノートのコンテンツを取得します。
 * @param uid ユーザーID
 * @param noteId ノートID
 * @returns TiptapのコンテンツJSON
 */
export const fetchNoteContent = async (uid: string, noteId: string): Promise<any> => {
    const notePath = `${KIGA_NOTES_STORAGE_PATH}/${uid}/${noteId}.json`;
    const storageRef = ref(storage, notePath);
    try {
        const bytes = await getBytes(storageRef);
        const decoder = new TextDecoder('utf-8');
        const contentJsonString = decoder.decode(bytes);
        return JSON.parse(contentJsonString);
    } catch (error: any) {
        if (error.code === 'storage/object-not-found') {
            console.warn(`Storage file for note ${noteId} not found. Returning empty content.`);
            return emptyContentJson;
        }
        throw error; // その他のエラーは再スロー
    }
};

/**
 * 新しいノートを作成します。
 * @param uid ユーザーID
 * @returns 作成された新しいノートのメタデータ
 */
export const createNewNote = async (uid: string): Promise<NoteMeta> => {
    const newNoteId = uuidv4();
    const newTitle = "無題のページ";
    const newContentJsonString = JSON.stringify(emptyContentJson);

    const noteMetaRef = doc(db, "users", uid, "kigaNotes", newNoteId);
    await setDoc(noteMetaRef, { title: newTitle, lastModified: serverTimestamp() });

    const notePath = `${KIGA_NOTES_STORAGE_PATH}/${uid}/${newNoteId}.json`;
    const storageRef = ref(storage, notePath);
    await uploadString(storageRef, newContentJsonString, 'raw', { contentType: 'application/json' });

    const newNoteMeta: NoteMeta = { id: newNoteId, title: newTitle, lastModified: Timestamp.now() };
    return newNoteMeta;
};

/**
 * ノートのコンテンツとメタデータを保存します。
 * @param uid ユーザーID
 * @param noteId ノートID
 * @param title 保存するタイトル
 * @param contentJson 保存するコンテンツJSON
 */
export const saveNote = async (uid: string, noteId: string, title: string, contentJson: any): Promise<void> => {
    const contentJsonString = JSON.stringify(contentJson);
    const notePath = `${KIGA_NOTES_STORAGE_PATH}/${uid}/${noteId}.json`;
    const storageRef = ref(storage, notePath);
    await uploadString(storageRef, contentJsonString, 'raw', { contentType: 'application/json' });

    const noteMetaRef = doc(db, "users", uid, "kigaNotes", noteId);
    await setDoc(noteMetaRef, { title: title, lastModified: serverTimestamp() }, { merge: true });
};

/**
 * ノートのメタデータ（タイトルと最終更新日時）を更新します。
 * @param uid ユーザーID
 * @param noteId ノートID
 * @param title 更新するタイトル
 */
export const updateNoteMeta = async (uid: string, noteId: string, title: string): Promise<void> => {
    const noteMetaRef = doc(db, "users", uid, "kigaNotes", noteId);
    await setDoc(noteMetaRef, { title: title, lastModified: serverTimestamp() }, { merge: true });
};


/**
 * ノートを削除します。
 * @param uid ユーザーID
 * @param noteId 削除するノートID
 */
export const deleteNote = async (uid: string, noteId: string): Promise<void> => {
    const noteMetaRef = doc(db, "users", uid, "kigaNotes", noteId);
    await deleteDoc(noteMetaRef);

    const notePath = `${KIGA_NOTES_STORAGE_PATH}/${uid}/${noteId}.json`;
    const storageFileRef = ref(storage, notePath);
    try {
        await deleteObject(storageFileRef);
    } catch (storageError: any) {
        if (storageError.code === 'storage/object-not-found') {
            console.warn(`Storage file for note ${noteId} not found, but proceeding with meta deletion.`);
        } else {
            // 予期せぬエラーは再スローして呼び出し元に通知
            throw storageError;
        }
    }
};


// --- Local Storage Utilities ---

const getLocalStorageKey = (uid: string, noteId: string, type: 'title' | 'content_json' | 'lastOpened') => {
    if (type === 'lastOpened') return `kigaNote_${uid}_lastOpened`;
    return `kigaNote_${uid}_${noteId}_${type}`;
};

export const getCachedTitle = (uid: string, noteId: string): string | null => {
    return localStorage.getItem(getLocalStorageKey(uid, noteId, 'title'));
};

export const setCachedTitle = (uid: string, noteId: string, title: string) => {
    localStorage.setItem(getLocalStorageKey(uid, noteId, 'title'), title);
};

export const getCachedContent = (uid: string, noteId: string): any | null => {
    const jsonString = localStorage.getItem(getLocalStorageKey(uid, noteId, 'content_json'));
    if (!jsonString) return null;
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        console.warn(`Failed to parse local content JSON for ${noteId}.`, e);
        return null;
    }
};

export const setCachedContent = (uid: string, noteId: string, content: any) => {
    localStorage.setItem(getLocalStorageKey(uid, noteId, 'content_json'), JSON.stringify(content));
};

export const removeCachedNote = (uid: string, noteId: string) => {
    localStorage.removeItem(getLocalStorageKey(uid, noteId, 'title'));
    localStorage.removeItem(getLocalStorageKey(uid, noteId, 'content_json'));
};

export const getLastOpenedNoteId = (uid: string): string | null => {
    return localStorage.getItem(getLocalStorageKey(uid, '', 'lastOpened'));
};

export const setLastOpenedNoteId = (uid: string, noteId: string) => {
    localStorage.setItem(getLocalStorageKey(uid, '', 'lastOpened'), noteId);
};
