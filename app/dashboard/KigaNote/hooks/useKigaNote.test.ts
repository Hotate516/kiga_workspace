import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useKigaNote } from './useKigaNote';
import * as kigaNoteService from '../services/kigaNoteService';
import { useUserStore } from '@/store/user';
import { toast } from 'react-hot-toast';
import { Timestamp } from 'firebase/firestore';

// モジュールのモック化
vi.mock('../services/kigaNoteService');
vi.mock('@/store/user');
vi.mock('react-hot-toast');
vi.mock('@/lib/firebase', () => {
  const TimestampMock = class {
    constructor(public seconds: number, public nanoseconds: number) {}
    toDate() { return new Date(this.seconds * 1000); }
    toMillis() { return this.seconds * 1000 + this.nanoseconds / 1000000; }
    static now() {
      const now = Date.now();
      return new TimestampMock(Math.floor(now / 1000), (now % 1000) * 1000000);
    }
  };
  return { Timestamp: TimestampMock };
});

// vi.mocked を使うためのキャスト
const mockedKigaNoteService = vi.mocked(kigaNoteService);
const mockedUseUserStore = vi.mocked(useUserStore);
// toastの各メソッドを個別にモックする
const mockedToast = {
  loading: vi.mocked(toast.loading),
  success: vi.mocked(toast.success),
  error: vi.mocked(toast.error),
};

// --- モックデータ ---
const mockUser = { uid: 'test-uid', name: 'Test User', email: 'test@example.com' };
const mockEditor = {
  setEditable: vi.fn(),
  commands: {
    setContent: vi.fn(),
    focus: vi.fn(),
  },
  // getJSONの戻り値のcontentプロパティの型をany[]にキャストして、柔軟なテストデータを許容するようにします。
  getJSON: vi.fn(() => ({ type: 'doc', content: [] as any[] })),
  isEditable: true,
  isEmpty: false,
};

const createMockNote = (id: string, title: string) => ({
  id,
  title,
  lastModified: new Timestamp(Date.now() / 1000, 0),
});

const note1 = createMockNote('note-1', 'Note 1');
const note2 = createMockNote('note-2', 'Note 2');

describe('useKigaNote Hook', () => {
  let cache: { [key: string]: any } = {};

  beforeEach(() => {
    vi.resetAllMocks();
    cache = {}; // 各テストの前にキャッシュをリセット

    // useUserStore のデフォルトモック
    mockedUseUserStore.mockReturnValue({
      user: mockUser,
      loaded: true,
      addNote: vi.fn(),
    } as any);
    // toast のモック
    mockedToast.loading.mockReturnValue('toast-loading-id');

    // kigaNoteServiceのキャッシュ関連のモックを実際の挙動に近づける
    mockedKigaNoteService.setCachedContent.mockImplementation((uid, noteId, content) => {
      cache[`${uid}-${noteId}-content`] = content;
    });
    mockedKigaNoteService.getCachedContent.mockImplementation((uid, noteId) => {
      return cache[`${uid}-${noteId}-content`] || null;
    });
    mockedKigaNoteService.setCachedTitle.mockImplementation((uid, noteId, title) => {
      cache[`${uid}-${noteId}-title`] = title;
    });
    mockedKigaNoteService.getCachedTitle.mockImplementation((uid, noteId) => {
      return cache[`${uid}-${noteId}-title`] || null;
    });
  });

  describe('Initial Data Loading', () => {
    it('should fetch notes and load the last opened note', async () => {
      mockedKigaNoteService.fetchNotesList.mockResolvedValue([note1, note2]);
      mockedKigaNoteService.getLastOpenedNoteId.mockReturnValue('note-2');
      mockedKigaNoteService.getCachedContent.mockReturnValue(null); //最初はキャッシュなし
      const mockContent = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'from-firebase' }] }] };
      mockedKigaNoteService.fetchNoteContent.mockResolvedValue(mockContent);

      const { result } = renderHook(() => useKigaNote(mockEditor as any));

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockedKigaNoteService.fetchNotesList).toHaveBeenCalledWith(mockUser.uid);
      expect(result.current.notesList).toEqual([note1, note2]);
      expect(result.current.currentNoteId).toBe('note-2');
      
      await waitFor(() => {
        expect(mockedKigaNoteService.fetchNoteContent).toHaveBeenCalledWith(mockUser.uid, 'note-2');
        expect(mockEditor.commands.setContent).toHaveBeenCalledWith(mockContent, false);
      });
    });

    it('should create a new note if no notes exist', async () => {
      mockedKigaNoteService.fetchNotesList.mockResolvedValue([]);
      mockedKigaNoteService.createNewNote.mockResolvedValue(note1);

      const { result } = renderHook(() => useKigaNote(mockEditor as any));

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(mockedKigaNoteService.createNewNote).toHaveBeenCalledWith(mockUser.uid);
      expect(result.current.notesList).toEqual([note1]);
      expect(result.current.currentNoteId).toBe('note-1');
    });
  });

  describe('Note Operations', () => {
    it('handleSave: should save the current note content and meta', async () => {
      // 初期状態でノートが読み込まれている状態をセットアップ
      mockedKigaNoteService.fetchNotesList.mockResolvedValue([note1]);
      mockedKigaNoteService.getLastOpenedNoteId.mockReturnValue('note-1');
      mockedKigaNoteService.getCachedContent.mockResolvedValue(null);
      const mockInitialContent = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'initial' }] }] };
      mockedKigaNoteService.fetchNoteContent.mockResolvedValue(mockInitialContent);

      const { result } = renderHook(() => useKigaNote(mockEditor as any));

      // 初期ロード完了を待つ
      await waitFor(() => expect(result.current.currentNoteId).toBe('note-1'));

      // ページタイトルとエディタ内容を更新
      const mockUpdatedContent = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'updated' }] }] };
      mockEditor.getJSON.mockReturnValue(mockUpdatedContent);
      await act(async () => {
        result.current.setPageTitle('Updated Title');
      });

      await act(async () => {
        await result.current.handleSave();
      });

      expect(mockedKigaNoteService.saveNote).toHaveBeenCalledWith(
        mockUser.uid,
        'note-1',
        'Updated Title',
        mockUpdatedContent
      );
      expect(mockedToast.success).toHaveBeenCalledWith(expect.any(String), { id: 'toast-loading-id' });
      expect(result.current.isSaving).toBe(false);
    });

    it('handleDelete: should delete the current note and select the next one', async () => {
        // 初期状態として2つのノートをセットアップ
        mockedKigaNoteService.fetchNotesList.mockResolvedValue([note2, note1]);
        mockedKigaNoteService.getLastOpenedNoteId.mockReturnValue('note-2');
        
        const { result } = renderHook(() => useKigaNote(mockEditor as any));
        
        // 読み込み完了を待つ
        await waitFor(() => expect(result.current.currentNoteId).toBe('note-2'));
        
        // window.confirmをモック
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        
        await act(async () => {
            await result.current.handleDelete();
        });

        expect(mockedKigaNoteService.deleteNote).toHaveBeenCalledWith(mockUser.uid, 'note-2');
        expect(mockedKigaNoteService.removeCachedNote).toHaveBeenCalledWith(mockUser.uid, 'note-2');
        expect(mockedToast.success).toHaveBeenCalledWith(expect.any(String), { id: 'toast-loading-id' });
        
        // 削除後、残っているノート(note1)が選択されることを確認
        expect(result.current.notesList.length).toBe(1);
        expect(result.current.notesList[0].id).toBe('note-1');
        expect(result.current.currentNoteId).toBe('note-1');
    });

    it('handleDelete: should not delete the last note', async () => {
        mockedKigaNoteService.fetchNotesList.mockResolvedValue([note1]);
        mockedKigaNoteService.getLastOpenedNoteId.mockReturnValue('note-1');
        
        const { result } = renderHook(() => useKigaNote(mockEditor as any));
        
        await waitFor(() => expect(result.current.currentNoteId).toBe('note-1'));
        
        await act(async () => {
            await result.current.handleDelete();
        });

        expect(mockedKigaNoteService.deleteNote).not.toHaveBeenCalled();
        expect(mockedToast.error).toHaveBeenCalledWith("最後のノートは削除できません。");
    });
  });

  describe('Cache Handling', () => {
    it('should load note from cache if available', async () => {
      // 初期状態セットアップ
      mockedKigaNoteService.fetchNotesList.mockResolvedValue([note1]);
      mockedKigaNoteService.getLastOpenedNoteId.mockReturnValue('note-1');
      
      // キャッシュのモック
      const mockCachedContent = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'from-cache' }] }] };
      mockedKigaNoteService.getCachedContent.mockReturnValue(mockCachedContent);
      mockedKigaNoteService.getCachedTitle.mockReturnValue('Cached Title');

      const { result } = renderHook(() => useKigaNote(mockEditor as any));

      // 初期ロードとノート選択を待つ
      await waitFor(() => expect(result.current.currentNoteId).toBe('note-1'));

      // 検証
      await waitFor(() => {
        // キャッシュ取得が試みられる
        expect(mockedKigaNoteService.getCachedContent).toHaveBeenCalledWith(mockUser.uid, 'note-1');
        // キャッシュからコンテンツがセットされる
        expect(mockEditor.commands.setContent).toHaveBeenCalledWith(mockCachedContent, false);
        // タイトルもキャッシュからセットされる
        expect(result.current.pageTitle).toBe('Cached Title');
        // Firebaseからのデータ取得は呼ばれない
        expect(mockedKigaNoteService.fetchNoteContent).not.toHaveBeenCalled();
      });
    });

    it('should load from Firebase and set cache if cache is not available', async () => {
      // 初期状態セットアップ
      mockedKigaNoteService.fetchNotesList.mockResolvedValue([note1]);
      mockedKigaNoteService.getLastOpenedNoteId.mockReturnValue('note-1');
      
      // キャッシュは存在しない
      mockedKigaNoteService.getCachedContent.mockReturnValue(null);
      mockedKigaNoteService.getCachedTitle.mockReturnValue(null);

      // Firebaseからのレスポンスをモック
      const mockFirebaseContent = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'from-firebase' }] }] };
      mockedKigaNoteService.fetchNoteContent.mockResolvedValue(mockFirebaseContent);

      const { result } = renderHook(() => useKigaNote(mockEditor as any));

      // 初期ロードとノート選択を待つ
      await waitFor(() => expect(result.current.currentNoteId).toBe('note-1'));

      // 検証
      await waitFor(() => {
        // キャッシュ取得が試みられる
        expect(mockedKigaNoteService.getCachedContent).toHaveBeenCalledWith(mockUser.uid, 'note-1');
        // Firebaseから取得が呼ばれる
        expect(mockedKigaNoteService.fetchNoteContent).toHaveBeenCalledWith(mockUser.uid, 'note-1');
        // Firebaseのコンテンツがエディタにセットされる
        expect(mockEditor.commands.setContent).toHaveBeenCalledWith(mockFirebaseContent, false);
        // 取得したコンテンツがキャッシュに保存される
        expect(mockedKigaNoteService.setCachedContent).toHaveBeenCalledWith(mockUser.uid, 'note-1', mockFirebaseContent);
      });
    });
  });

  describe('Error Handling', () => {
    it('should show an error toast if loading a note fails', async () => {
      // 初期状態セットアップ
      mockedKigaNoteService.fetchNotesList.mockResolvedValue([note1]);
      mockedKigaNoteService.getLastOpenedNoteId.mockReturnValue('note-1');
      
      // キャッシュはなし
      mockedKigaNoteService.getCachedContent.mockReturnValue(null);

      // Firebaseからの取得が失敗するようにモック
      const error = new Error('Failed to fetch from Firebase');
      mockedKigaNoteService.fetchNoteContent.mockRejectedValue(error);

      const { result } = renderHook(() => useKigaNote(mockEditor as any));

      // 初期ロードとノート選択を待つ
      await waitFor(() => expect(result.current.currentNoteId).toBe('note-1'));

      // 検証
      await waitFor(() => {
        expect(mockedToast.error).toHaveBeenCalledWith(`ノートの読み込みに失敗しました: ${error.message}`);
        // ローディング状態が解除されること
        expect(result.current.isNoteLoading).toBe(false);
        // エディタが再度有効化されること
        expect(mockEditor.setEditable).toHaveBeenCalledWith(true);
      });
    });

    it('should show an error toast if saving a note fails', async () => {
      // 初期状態セットアップ
      mockedKigaNoteService.fetchNotesList.mockResolvedValue([note1]);
      mockedKigaNoteService.getLastOpenedNoteId.mockReturnValue('note-1');
      const { result } = renderHook(() => useKigaNote(mockEditor as any));
      await waitFor(() => expect(result.current.currentNoteId).toBe('note-1'));

      // 保存失敗をモック
      const error = new Error('Failed to save');
      mockedKigaNoteService.saveNote.mockRejectedValue(error);

      await act(async () => {
        await result.current.handleSave();
      });

      // 検証
      expect(mockedToast.error).toHaveBeenCalledWith(`保存失敗: ${error.message}`, { id: 'toast-loading-id' });
      expect(result.current.isSaving).toBe(false);
    });

    it('should show an error toast if deleting a note fails', async () => {
      // 初期状態セットアップ
      mockedKigaNoteService.fetchNotesList.mockResolvedValue([note1, note2]);
      mockedKigaNoteService.getLastOpenedNoteId.mockReturnValue('note-1');
      const { result } = renderHook(() => useKigaNote(mockEditor as any));
      await waitFor(() => expect(result.current.currentNoteId).toBe('note-1'));

      // 削除失敗をモック
      const error = new Error('Failed to delete');
      mockedKigaNoteService.deleteNote.mockRejectedValue(error);
      vi.spyOn(window, 'confirm').mockReturnValue(true);

      await act(async () => {
        await result.current.handleDelete();
      });

      // 検証
      expect(mockedToast.error).toHaveBeenCalledWith(`削除失敗: ${error.message}`, { id: 'toast-loading-id' });
      expect(result.current.isDeleting).toBe(false);
    });
  });

  describe('State Persistence on Note Switch', () => {
    it('should cache unsaved content when switching notes and restore it when switching back', async () => {
      // 1. 初期状態として2つのノートをセットアップ
      mockedKigaNoteService.fetchNotesList.mockResolvedValue([note1, note2]);
      mockedKigaNoteService.getLastOpenedNoteId.mockReturnValue('note-1');
      const initialContentNote1 = { type: 'doc', content: [{ type: 'paragraph', text: 'Initial Note 1' }] };
      const initialContentNote2 = { type: 'doc', content: [{ type: 'paragraph', text: 'Initial Note 2' }] };
      mockedKigaNoteService.fetchNoteContent
        .mockResolvedValueOnce(initialContentNote1)
        .mockResolvedValueOnce(initialContentNote2);

      const { result } = renderHook(() => useKigaNote(mockEditor as any));

      // 2. note-1が読み込まれるのを待つ
      await waitFor(() => expect(result.current.currentNoteId).toBe('note-1'));
      expect(mockEditor.commands.setContent).toHaveBeenCalledWith(initialContentNote1, false);

      // 3. note-1の内容を編集する（エディタの状態をシミュレート）
      const editedContentNote1 = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Edited Note 1' }] }] };
      mockEditor.getJSON.mockReturnValue(editedContentNote1);

      // 4. note-2に切り替える
      await act(async () => {
        result.current.handleSelectNote('note-2');
      });
      
      // note-2が読み込まれるのを待つ
      await waitFor(() => expect(result.current.currentNoteId).toBe('note-2'));
      // この時点でnote-1の編集内容がキャッシュされているはず
      expect(mockedKigaNoteService.setCachedContent).toHaveBeenCalledWith(mockUser.uid, 'note-1', editedContentNote1);
      expect(mockEditor.commands.setContent).toHaveBeenCalledWith(initialContentNote2, false);

      // 5. 再びnote-1に戻る
      // note-2の内容をシミュレート
      const editedContentNote2 = { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Edited Note 2' }] }] };
      mockEditor.getJSON.mockReturnValue(editedContentNote2);

      await act(async () => {
        result.current.handleSelectNote('note-1');
      });

      // 6. note-1の編集中の内容が復元されることを確認
      await waitFor(() => expect(result.current.currentNoteId).toBe('note-1'));
      // この時点でnote-2の内容がキャッシュされているはず
      expect(mockedKigaNoteService.setCachedContent).toHaveBeenCalledWith(mockUser.uid, 'note-2', editedContentNote2);
      // そして、note-1の編集済み内容がエディタにセットされるはず
      expect(mockEditor.commands.setContent).toHaveBeenLastCalledWith(editedContentNote1, false);
    });
  });
});
