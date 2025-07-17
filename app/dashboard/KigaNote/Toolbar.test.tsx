import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Toolbar from './Toolbar';
import { Editor } from '@tiptap/react';

// Tiptap Editorのより堅牢なモックを作成
const createMockEditor = (): Editor => {
  const mockChainCommands = {
    focus: vi.fn().mockReturnThis(),
    toggleBold: vi.fn().mockReturnThis(),
    toggleItalic: vi.fn().mockReturnThis(),
    toggleUnderline: vi.fn().mockReturnThis(),
    toggleStrike: vi.fn().mockReturnThis(),
    toggleHeading: vi.fn().mockReturnThis(),
    toggleBulletList: vi.fn().mockReturnThis(),
    toggleOrderedList: vi.fn().mockReturnThis(),
    toggleBlockquote: vi.fn().mockReturnThis(),
    toggleCodeBlock: vi.fn().mockReturnThis(),
    setHorizontalRule: vi.fn().mockReturnThis(),
    setLink: vi.fn().mockReturnThis(),
    unsetLink: vi.fn().mockReturnThis(),
    setImage: vi.fn().mockReturnThis(),
    setColor: vi.fn().mockReturnThis(),
    toggleHighlight: vi.fn().mockReturnThis(),
    extendMarkRange: vi.fn().mockReturnThis(),
    run: vi.fn(() => true),
  };

  const mockCanCommands = {
    focus: vi.fn().mockReturnThis(),
    toggleBold: vi.fn().mockReturnThis(),
    toggleItalic: vi.fn().mockReturnThis(),
    toggleStrike: vi.fn().mockReturnThis(),
    run: vi.fn(() => true),
  };

  const chain = vi.fn(() => mockChainCommands);
  const can = () => ({
    chain: vi.fn(() => mockCanCommands),
  });

  const mockEditor = {
    isActive: vi.fn().mockReturnValue(false),
    chain: chain,
    can: can,
    getAttributes: vi.fn().mockReturnValue({ href: '' }),
  };

  return mockEditor as unknown as Editor;
};

// window.promptのモック
const mockPrompt = vi.fn();
global.window.prompt = mockPrompt;

describe('Toolbar', () => {
  let mockEditor: Editor;

  beforeEach(() => {
    mockEditor = createMockEditor();
    vi.clearAllMocks();
    mockPrompt.mockClear();
  });

  it('should render toolbar buttons', () => {
    render(<Toolbar editor={mockEditor} />);
    expect(screen.getByTitle('太字')).toBeInTheDocument();
    expect(screen.getByTitle('リンク')).toBeInTheDocument();
    expect(screen.getByTitle('画像')).toBeInTheDocument();
  });

  it('should call setLink with the provided URL when link button is clicked and URL is provided', () => {
    const testUrl = 'https://example.com';
    mockPrompt.mockReturnValue(testUrl);
    render(<Toolbar editor={mockEditor} />);
    const linkButton = screen.getByTitle('リンク');
    fireEvent.click(linkButton);

    expect(mockPrompt).toHaveBeenCalledTimes(1);
    expect(mockPrompt).toHaveBeenCalledWith('URLを入力してください');
    expect(mockEditor.chain().setLink).toHaveBeenCalledWith({ href: testUrl });
  });

  it('should not call setLink when link button is clicked and URL is not provided', () => {
    mockPrompt.mockReturnValue(null); // ユーザーがキャンセルを押したケース
    render(<Toolbar editor={mockEditor} />);
    const linkButton = screen.getByTitle('リンク');
    fireEvent.click(linkButton);

    expect(mockPrompt).toHaveBeenCalledTimes(1);
    expect(mockEditor.chain().setLink).not.toHaveBeenCalled();
  });

  describe('Basic formatting buttons', () => {
    it('should call toggleBold when bold button is clicked', () => {
      render(<Toolbar editor={mockEditor} />);
      const boldButton = screen.getByTitle('太字');
      fireEvent.click(boldButton);
      expect(mockEditor.chain().toggleBold).toHaveBeenCalledTimes(1);
    });

    it('should call toggleItalic when italic button is clicked', () => {
      render(<Toolbar editor={mockEditor} />);
      const italicButton = screen.getByTitle('イタリック');
      fireEvent.click(italicButton);
      expect(mockEditor.chain().toggleItalic).toHaveBeenCalledTimes(1);
    });

    it('should call toggleHeading with level 1 when H1 button is clicked', () => {
      render(<Toolbar editor={mockEditor} />);
      const h1Button = screen.getByTitle('見出し1');
      fireEvent.click(h1Button);
      expect(mockEditor.chain().toggleHeading).toHaveBeenCalledWith({ level: 1 });
    });
  });

  describe('Color and Highlight buttons', () => {
    it('should call setColor when color input is changed', () => {
      render(<Toolbar editor={mockEditor} />);
      const colorInput = screen.getByTitle('文字色');
      const testColor = '#ff0000';
      fireEvent.input(colorInput, { target: { value: testColor } });
      expect(mockEditor.chain().setColor).toHaveBeenCalledWith(testColor);
    });

    it('should call toggleHighlight when highlight button is clicked', () => {
      render(<Toolbar editor={mockEditor} />);
      const highlightButton = screen.getByTitle('背景ハイライト');
      fireEvent.click(highlightButton);
      expect(mockEditor.chain().toggleHighlight).toHaveBeenCalledWith({ color: '#FFF3A3' });
    });
  });
});
