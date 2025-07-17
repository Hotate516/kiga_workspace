import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createNewNote, saveNote, deleteNote } from './kigaNoteService';
import { db, storage, setDoc, uploadString, doc, ref, serverTimestamp, deleteDoc, deleteObject } from '@/lib/firebase';

// Firebaseモジュールをモック化
vi.mock('@/lib/firebase', () => ({
    db: vi.fn(),
    storage: vi.fn(),
    doc: vi.fn(),
    ref: vi.fn(),
    setDoc: vi.fn(),
    uploadString: vi.fn(),
    deleteDoc: vi.fn(),
    deleteObject: vi.fn(),
    serverTimestamp: vi.fn(() => 'mock-timestamp'),
    // createNewNote関数がTimestampを返すため、モックを追加
    Timestamp: {
        now: vi.fn(() => ({
            toDate: () => new Date(),
            toMillis: () => Date.now(),
        })),
    },
}));

// uuidをモック化して、常に同じIDを返すようにする
vi.mock('uuid', () => ({
    v4: () => 'mock-uuid-1234',
}));

const mockedSetDoc = vi.mocked(setDoc);
const mockedUploadString = vi.mocked(uploadString);
const mockedDoc = vi.mocked(doc);
const mockedRef = vi.mocked(ref);
const mockedDeleteDoc = vi.mocked(deleteDoc);
const mockedDeleteObject = vi.mocked(deleteObject);

describe('kigaNoteService', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('createNewNote', () => {
        it('should create a new note in Firestore and Storage with correct data', async () => {
            const uid = 'test-user-id';
            const expectedNoteId = 'mock-uuid-1234';
            const expectedTitle = '無題のページ';
            const expectedContent = { type: "doc", content: [{ type: "paragraph" }] };
            const expectedContentString = JSON.stringify(expectedContent);

            // モックの戻り値を設定
            mockedDoc.mockReturnValue('mock-doc-ref' as any);
            mockedRef.mockReturnValue('mock-storage-ref' as any);

            await createNewNote(uid);

            // Firestoreへの書き込み（setDoc）が正しく呼ばれたか検証
            expect(mockedSetDoc).toHaveBeenCalledWith(
                'mock-doc-ref',
                {
                    title: expectedTitle,
                    lastModified: 'mock-timestamp',
                }
            );
            expect(mockedDoc).toHaveBeenCalledWith(
                db,
                "users",
                uid,
                "kigaNotes",
                expectedNoteId
            );

            // Storageへのアップロード（uploadString）が正しく呼ばれたか検証
            expect(mockedUploadString).toHaveBeenCalledWith(
                'mock-storage-ref',
                expectedContentString,
                'raw',
                { contentType: 'application/json' }
            );
            expect(mockedRef).toHaveBeenCalledWith(
                storage,
                `kigaNotes/${uid}/${expectedNoteId}.json`
            );
        });
    });

    describe('saveNote', () => {
        it('should save content to Storage and update meta in Firestore', async () => {
            const uid = 'test-user-id';
            const noteId = 'existing-note-id';
            const title = 'Updated Title';
            const contentJson = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Updated content' }] }] };
            const contentJsonString = JSON.stringify(contentJson);

            mockedDoc.mockReturnValue('mock-doc-ref' as any);
            mockedRef.mockReturnValue('mock-storage-ref' as any);

            await saveNote(uid, noteId, title, contentJson);

            // Storageへの保存を検証
            expect(mockedUploadString).toHaveBeenCalledWith(
                'mock-storage-ref',
                contentJsonString,
                'raw',
                { contentType: 'application/json' }
            );
            expect(mockedRef).toHaveBeenCalledWith(
                storage,
                `kigaNotes/${uid}/${noteId}.json`
            );

            // Firestoreのメタデータ更新を検証
            expect(mockedSetDoc).toHaveBeenCalledWith(
                'mock-doc-ref',
                {
                    title: title,
                    lastModified: 'mock-timestamp',
                },
                { merge: true }
            );
            expect(mockedDoc).toHaveBeenCalledWith(
                db,
                "users",
                uid,
                "kigaNotes",
                noteId
            );
        });
    });

    describe('deleteNote', () => {
        it('should delete the note from Firestore and Storage', async () => {
            const uid = 'test-user-id';
            const noteId = 'note-to-delete';

            mockedDoc.mockReturnValue('mock-doc-ref' as any);
            mockedRef.mockReturnValue('mock-storage-ref' as any);

            await deleteNote(uid, noteId);

            // Firestoreからの削除を検証
            expect(mockedDeleteDoc).toHaveBeenCalledWith('mock-doc-ref');
            expect(mockedDoc).toHaveBeenCalledWith(db, "users", uid, "kigaNotes", noteId);

            // Storageからの削除を検証
            expect(mockedDeleteObject).toHaveBeenCalledWith('mock-storage-ref');
            expect(mockedRef).toHaveBeenCalledWith(storage, `kigaNotes/${uid}/${noteId}.json`);
        });
    });
});
