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
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));
vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(),
  EditorContent: vi.fn(({ editor }) => <div data-testid="mock-editor-content" />),
  Editor: vi.fn(() => null),
}));
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
  const editor: any = {
    isEditable: true,
    destroy: vi.fn(),
    setOptions: vi.fn(),
    isActive: vi.fn(() => false),
    getJSON: vi.fn(() => ({ type: 'doc', content: [] })),
    getAttributes: vi.fn(() => ({})),
    commands: {},
    chain: vi.fn(),
    can: vi.fn(),
  };

  const commandMethods = [
    'focus', 'setContent', 'toggleHeading', 'run', 'toggleBold', 'toggleItalic',
    'toggleUnderline', 'toggleHighlight', 'setColor', 'unsetAllMarks', 'undo', 'redo',
    'toggleStrike', 'toggleBulletList', 'toggleOrderedList', 'setParagraph',
    'setHorizontalRule', 'setHardBreak', 'clearNodes', 'insertContent', 'setLink', 'unsetTextAlign'
  ];

  const chainable = {};
  commandMethods.forEach(method => {
    const commandMock = vi.fn(() => chainable);
    editor.commands[method] = commandMock;
    // @ts-ignore
    chainable[method] = commandMock;
  });
  // @ts-ignore
  chainable.run = vi.fn();

  editor.chain = vi.fn(() => chainable);
  editor.can = vi.fn(() => ({
    chain: () => chainable,
  }));

  return editor;
};

describe('KigaNotePage', () => {
  let mockEditor: any;

  beforeEach(() => {
    vi.resetAllMocks();

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
});
