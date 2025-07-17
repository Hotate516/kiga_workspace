import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import KigaNotePage from './page';
import { useEditor } from '@tiptap/react';
import { useKigaNote } from './hooks/useKigaNote';
import { useUserStore, User, NoteMeta } from '@/store/user';

// モジュール全体をモック化
vi.mock('./hooks/useKigaNote');
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
  // @ts-ignore
  return { Timestamp: TimestampMock };
});

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

vi.mock('@tiptap/react', async (importOriginal) => {
  const original = await importOriginal<typeof import('@tiptap/react')>();
  return {
    ...original,
    useEditor: vi.fn(),
    EditorContent: vi.fn(({ editor }) => {
      const placeholderText = editor?.isEmpty ? "ここに入力してください..." : "";
      return <div data-testid="mock-editor-content" data-placeholder={placeholderText} />;
    }),
    Editor: vi.fn(() => null),
  };
});
vi.mock('@/store/user');

// vi.mocked を使うためにモックされた関数をキャスト
const mockedUseKigaNote = vi.mocked(useKigaNote);
const mockedUseUserStore = vi.mocked(useUserStore);

// モックデータとヘルパー
const mockUser: User = {
  uid: 'test-uid',
  name: 'Test User',
  email: 'test@example.com',
  photoURL: 'test.jpg',
};

// Timestampをモックから動的にインポートする
let Timestamp: any;
beforeEach(async () => {
  const firebase = await import('@/lib/firebase');
  Timestamp = firebase.Timestamp;
});

const createMockTimestamp = () => {
  const now = new Date();
  const seconds = Math.floor(now.getTime() / 1000);
  const nanoseconds = (now.getTime() % 1000) * 1000000;
  return new Timestamp(seconds, nanoseconds);
};

const createMockNote = (id: string, title: string): NoteMeta => ({
  id,
  title,
  lastModified: createMockTimestamp(),
});

type MockUseKigaNote = ReturnType<typeof useKigaNote>;

const createUseKigaNoteMockValues = (
  overrides: Partial<MockUseKigaNote> = {}
): MockUseKigaNote => {
  const defaults: MockUseKigaNote = {
    notesList: [],
    currentNoteId: null,
    pageTitle: '',
    lastSaved: null,
    isLoading: true,
    isNoteLoading: false,
    isSaving: false,
    isDeleting: false,
    user: null,
    loaded: false,
    setPageTitle: vi.fn(),
    handleSelectNote: vi.fn(),
    handleCreateNewPage: vi.fn(),
    handleSave: vi.fn(),
    handleDelete: vi.fn(),
    handleEditorUpdate: vi.fn(),
  };
  return { ...defaults, ...overrides };
};


const createFullTiptapEditorMock = () => {
  // 各コマンドのモックを保持するオブジェクト
  const commandMocks: { [key: string]: any } = {};

  const commandMethods = [
    'focus', 'setContent', 'toggleHeading', 'toggleBold', 'toggleItalic',
    'toggleUnderline', 'toggleHighlight', 'setColor', 'unsetAllMarks', 'undo', 'redo',
    'toggleStrike', 'toggleBulletList', 'toggleOrderedList', 'setParagraph',
    'setHorizontalRule', 'setHardBreak', 'clearNodes', 'insertContent', 'setLink', 'unsetTextAlign',
    'run'
  ];

  // チェーン可能なオブジェクトを生成するファクトリ
  const createChainable = () => {
    const chainable: { [key: string]: any } = {};
    commandMethods.forEach(method => {
      // 各メソッドのモックを作成し、常に chainable 自身を返すようにする
      const mock = vi.fn(() => chainable);
      chainable[method] = mock;
      commandMocks[method] = mock; // 後でアサーションできるように保存
    });
    return chainable;
  };

  const editor: any = {
    isEditable: true,
    destroy: vi.fn(),
    setOptions: vi.fn(),
    isActive: vi.fn(() => false),
    getJSON: vi.fn(() => ({ type: 'doc', content: [] })),
    getAttributes: vi.fn(() => ({})),
    // chain() が呼ばれるたびに、新しいチェーンインスタンスを返す
    chain: () => createChainable(),
    can: () => ({
      chain: () => createChainable(),
    }),
    // テストから直接モックにアクセスできるようにする
    _commandMocks: commandMocks,
  };

  return editor;
};

describe('KigaNotePage', () => {
  let mockEditor: any;

  beforeEach(() => {
    vi.resetAllMocks();
    mockPush.mockClear();

    // useKigaNote のデフォルトモックを設定
    mockedUseKigaNote.mockReturnValue(createUseKigaNoteMockValues());

    // useEditor のモック
    mockEditor = createFullTiptapEditorMock();
    vi.mocked(useEditor).mockReturnValue(mockEditor);

    // useUserStore のモック
    mockedUseUserStore.mockReturnValue({
      user: mockUser,
      loaded: true,
      addNote: vi.fn(),
      notes: [],
      selectedNoteId: null,
      setNotes: vi.fn(),
      setSelectedNoteId: vi.fn(),
    });
  });

  it('should display loading state initially', () => {
    mockedUseKigaNote.mockReturnValueOnce(createUseKigaNoteMockValues({
      isLoading: true,
      notesList: [],
      user: mockUser,
      loaded: true,
    }));
    render(<KigaNotePage />);
    // メインコンテンツではなく、サイドバーのローディングテキストを確認する
    expect(screen.getByText('ノートリスト読込中...')).toBeInTheDocument();
  });

  it('should display "no notes" message when list is empty', async () => {
    mockedUseKigaNote.mockReturnValueOnce(createUseKigaNoteMockValues({
      isLoading: false,
      notesList: [],
      user: mockUser,
      loaded: true,
      currentNoteId: null,
    }));
    render(<KigaNotePage />);
    expect(await screen.findByText('ノートがありません。')).toBeInTheDocument();
    expect(screen.getByText('最初のノートを作成する')).toBeInTheDocument();
  });

  it('should render notes list and editor when data is loaded', async () => {
    const notes = [createMockNote('note-1', 'Test Note 1')];
    mockedUseKigaNote.mockReturnValueOnce(createUseKigaNoteMockValues({
      isLoading: false,
      notesList: notes,
      currentNoteId: 'note-1',
      pageTitle: 'Test Note 1',
      user: mockUser,
      loaded: true,
    }));

    render(<KigaNotePage />);

    expect(await screen.findByText('Test Note 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test Note 1')).toBeInTheDocument();
    expect(screen.getByText('Firebaseに保存')).toBeInTheDocument();
    expect(screen.getByTestId('mock-editor-content')).toBeInTheDocument();
  });

  it('should render multiple notes in the sidebar', async () => {
    const notes = [
      createMockNote('note-1', 'First Note'),
      createMockNote('note-2', 'Second Note'),
    ];
    mockedUseKigaNote.mockReturnValueOnce(createUseKigaNoteMockValues({
      isLoading: false,
      notesList: notes,
      currentNoteId: 'note-1',
      user: mockUser,
      loaded: true,
    }));

    render(<KigaNotePage />);

    expect(await screen.findByText('First Note')).toBeInTheDocument();
    expect(screen.getByText('Second Note')).toBeInTheDocument();
  });

  it('should call handleCreateNewPage when "Create New Page" button is clicked', async () => {
    const mockHandleCreateNewPage = vi.fn();
    mockedUseKigaNote.mockReturnValueOnce(createUseKigaNoteMockValues({
      isLoading: false,
      user: mockUser,
      loaded: true,
      handleCreateNewPage: mockHandleCreateNewPage,
    }));
    render(<KigaNotePage />);
    
    const createButton = await screen.findByText('＋ 新規ページ作成');
    fireEvent.click(createButton);

    expect(mockHandleCreateNewPage).toHaveBeenCalledTimes(1);
  });

  it('should call handleSelectNote when a note item is clicked', async () => {
    const mockHandleSelectNote = vi.fn();
    const notes = [createMockNote('note-1', 'My Note')];
    mockedUseKigaNote.mockReturnValueOnce(createUseKigaNoteMockValues({
      isLoading: false,
      notesList: notes,
      user: mockUser,
      loaded: true,
      handleSelectNote: mockHandleSelectNote,
    }));
    render(<KigaNotePage />);

    const noteItem = await screen.findByText('My Note');
    fireEvent.click(noteItem);

    expect(mockHandleSelectNote).toHaveBeenCalledWith('note-1');
  });

  it('should call handleSave when "Save" button is clicked', async () => {
    const mockHandleSave = vi.fn();
    const notes = [createMockNote('note-1', 'Test Note')];
    mockedUseKigaNote.mockReturnValueOnce(createUseKigaNoteMockValues({
      isLoading: false,
      notesList: notes,
      currentNoteId: 'note-1',
      user: mockUser,
      loaded: true,
      handleSave: mockHandleSave,
    }));
    render(<KigaNotePage />);

    const saveButton = await screen.findByText('Firebaseに保存');
    fireEvent.click(saveButton);

    expect(mockHandleSave).toHaveBeenCalledTimes(1);
  });

  it('should call handleDelete when "Delete" button is clicked', async () => {
    const mockHandleDelete = vi.fn();
    const notes = [
      createMockNote('note-1', 'Note 1'),
      createMockNote('note-2', 'Note 2'),
    ];
    mockedUseKigaNote.mockReturnValueOnce(createUseKigaNoteMockValues({
      isLoading: false,
      notesList: notes,
      currentNoteId: 'note-1',
      user: mockUser,
      loaded: true,
      handleDelete: mockHandleDelete,
    }));
    render(<KigaNotePage />);

    const deleteButton = await screen.findByTitle('現在のノートを削除');
    fireEvent.click(deleteButton);

    expect(mockHandleDelete).toHaveBeenCalledTimes(1);
  });

  it('should call setPageTitle when title input is changed', async () => {
    const mockSetPageTitle = vi.fn();
    const notes = [createMockNote('note-1', 'Initial Title')];
    mockedUseKigaNote.mockReturnValueOnce(createUseKigaNoteMockValues({
      isLoading: false,
      notesList: notes,
      currentNoteId: 'note-1',
      pageTitle: 'Initial Title',
      user: mockUser,
      loaded: true,
      setPageTitle: mockSetPageTitle,
    }));
    render(<KigaNotePage />);

    const titleInput = await screen.findByDisplayValue('Initial Title');
    fireEvent.change(titleInput, { target: { value: 'New Title' } });

    expect(mockSetPageTitle).toHaveBeenCalledWith('New Title');
  });

  it('should display "Saving..." status when isSaving is true', async () => {
    const notes = [createMockNote('note-1', 'Test Note')];
    mockedUseKigaNote.mockReturnValueOnce(createUseKigaNoteMockValues({
      isLoading: false,
      notesList: notes,
      currentNoteId: 'note-1',
      user: mockUser,
      loaded: true,
      isSaving: true,
    }));
    render(<KigaNotePage />);

    expect(await screen.findByText('保存中...')).toBeInTheDocument();
  });

  it('should display "Deleting" status when isDeleting is true', async () => {
    const notes = [createMockNote('note-1', 'Test Note')];
    mockedUseKigaNote.mockReturnValueOnce(createUseKigaNoteMockValues({
      isLoading: false,
      notesList: notes,
      currentNoteId: 'note-1',
      user: mockUser,
      loaded: true,
      isDeleting: true,
    }));
    render(<KigaNotePage />);

    // 削除ボタンのテキストが「削除中」に変わることを確認
    const deleteButton = await screen.findByTitle('現在のノートを削除');
    expect(deleteButton).toHaveTextContent('削除中');
  });

  describe('Authentication states', () => {
    it('should display login prompt when user is not logged in', async () => {
      mockedUseKigaNote.mockReturnValueOnce(createUseKigaNoteMockValues({
        isLoading: false,
        user: null, // ユーザーがいない状態
        loaded: true,
      }));

      render(<KigaNotePage />);

      expect(await screen.findByText('KigaNoteを利用するにはログインしてください。')).toBeInTheDocument();
      // サイドバーにもログインを促すメッセージがあることを確認
      expect(screen.getByText('ログインしてください')).toBeInTheDocument();
    });
  });

  describe('Right sidebar navigation', () => {
    it('should navigate to profile page when profile icon is clicked', async () => {
      mockedUseKigaNote.mockReturnValueOnce(createUseKigaNoteMockValues({
        isLoading: false,
        notesList: [createMockNote('note-1', 'Test Note')],
        currentNoteId: 'note-1',
        user: mockUser,
        loaded: true,
      }));

      render(<KigaNotePage />);

      const profileButton = await screen.findByTitle(mockUser.name || "プロフィール");
      fireEvent.click(profileButton);

      expect(mockPush).toHaveBeenCalledWith('/dashboard/profile');
    });
  });

  describe('Toolbar interactions', () => {
    it('should call toggleUnderline when underline button is clicked', async () => {
      const notes = [createMockNote('note-1', 'Test Note')];
      mockedUseKigaNote.mockReturnValueOnce(createUseKigaNoteMockValues({
        isLoading: false,
        notesList: notes,
        currentNoteId: 'note-1',
        user: mockUser,
        loaded: true,
      }));
      render(<KigaNotePage />);

      // Toolbarコンポーネント内の下線ボタンを探す
      // 'title'属性が「下線」のボタンを探す
      const underlineButton = await screen.findByTitle('下線');
      fireEvent.click(underlineButton);

      // モック化されたeditorのコマンドが呼ばれたか検証
      // editor.chain()が呼ばれるたびに新しいモックが作られるため、
      // クリック前にモックへの参照を保持することはできない。
      // そのため、クリック後に呼び出された回数を直接アサートする。
      expect(mockEditor._commandMocks.focus).toHaveBeenCalled();
      expect(mockEditor._commandMocks.toggleUnderline).toHaveBeenCalledTimes(1);
      expect(mockEditor._commandMocks.run).toHaveBeenCalledTimes(1);
    });
  });

  describe('Editor features', () => {
    it('should have placeholder attribute when editor is empty', async () => {
      const notes = [createMockNote('note-1', 'Test Note')];
      mockedUseKigaNote.mockReturnValue(createUseKigaNoteMockValues({
        isLoading: false,
        notesList: notes,
        currentNoteId: 'note-1',
        user: mockUser,
        loaded: true,
      }));

      // useEditorのモックをセットアップ
      const editorWithPlaceholder = createFullTiptapEditorMock();
      // @ts-ignore
      editorWithPlaceholder.isEmpty = true; // エディタが空であると仮定
      vi.mocked(useEditor).mockReturnValue(editorWithPlaceholder);

      render(<KigaNotePage />);

      // プレースホルダーの属性が正しく設定されていることを確認
      const editorNode = await screen.findByTestId('mock-editor-content');
      expect(editorNode).toHaveAttribute('data-placeholder', 'ここに入力してください...');
    });
  });
});
