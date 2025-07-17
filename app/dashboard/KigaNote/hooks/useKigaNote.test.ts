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
  beforeEach(() => {
    vi.resetAllMocks();
    // useUserStore のデフォルトモック
    mockedUseUserStore.mockReturnValue({
      user: mockUser,
      loaded: true,
      addNote: vi.fn(),
    } as any);
    // toast のモック
    mockedToast.loading.mockReturnValue('toast-loading-id');
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
});
