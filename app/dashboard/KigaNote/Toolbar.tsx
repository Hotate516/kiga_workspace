// app/dashboard/KigaNote/Toolbar.tsx
"use client";

import React from 'react';
import { Editor } from '@tiptap/react';
import {
    Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3,
    List, ListOrdered, Quote, Code, Link as LinkIcon, Image as ImageIcon, Minus, Pilcrow, Palette, CaseSensitive // アイコンの例 (Lucide Reactなどから)
} from 'lucide-react'; // Lucide Reactを使用する場合 (npm install lucide-react)

// FormatButtonコンポーネントを定義
interface FormatButtonProps {
    onClick: () => void;
    disabled?: boolean;
    isActive?: boolean;
    title: string;
    children: React.ReactNode;
}

const FormatButton: React.FC<FormatButtonProps> = ({ onClick, disabled = false, isActive = false, title, children }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`p-2 rounded ${isActive ? 'bg-slate-200 dark:bg-slate-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        title={title}
    >
        {children}
    </button>
);


interface ToolbarProps {
  editor: Editor | null;
}

const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const url = window.prompt('URLを入力してください');

    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  // 画像挿入のダミー関数 (実際にはファイルアップロードやURL入力が必要)
  const addImage = () => {
    const url = window.prompt('画像URLを入力してください:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };


  return (
    <div className="flex flex-wrap items-center gap-1 p-2 mb-4 bg-white dark:bg-[#2A3B4D] rounded-lg shadow border dark:border-slate-700 sticky top-0 z-10">
        {/* 見出し */}
        <FormatButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} isActive={editor.isActive('heading', { level: 1 })} title="見出し1">
            <Heading1 size={18} />
        </FormatButton>
        <FormatButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} isActive={editor.isActive('heading', { level: 2 })} title="見出し2">
            <Heading2 size={18} />
        </FormatButton>
        <FormatButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} isActive={editor.isActive('heading', { level: 3 })} title="見出し3">
            <Heading3 size={18} />
        </FormatButton>
        <div className="h-6 border-l border-slate-300 dark:border-slate-600 mx-1"></div>

        {/* 太字、イタリック、下線、取り消し線 */}
        <FormatButton onClick={() => editor.chain().focus().toggleBold().run()} disabled={!editor.can().chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="太字">
            <Bold size={18} />
        </FormatButton>
        <FormatButton onClick={() => editor.chain().focus().toggleItalic().run()} disabled={!editor.can().chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="イタリック">
            <Italic size={18} />
        </FormatButton>
        <FormatButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="下線">
            <Underline size={18} />
        </FormatButton>
        <FormatButton onClick={() => editor.chain().focus().toggleStrike().run()} disabled={!editor.can().chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="取り消し線">
            <Strikethrough size={18} />
        </FormatButton>
        <div className="h-6 border-l border-slate-300 dark:border-slate-600 mx-1"></div>

        {/* 文字色・背景色 */}
        <input type="color" onInput={event => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()} value={editor.getAttributes('textStyle').color || '#000000'} className="w-8 h-8 p-0 border-none rounded bg-transparent cursor-pointer" title="文字色" />
        <FormatButton onClick={() => editor.chain().focus().toggleHighlight({ color: '#FFF3A3' }).run()} isActive={editor.isActive('highlight', { color: '#FFF3A3' })} title="背景ハイライト">
            <Palette size={18} />
        </FormatButton>
        <div className="h-6 border-l border-slate-300 dark:border-slate-600 mx-1"></div>

        {/* リンク・画像 */}
        <FormatButton onClick={setLink} isActive={editor.isActive('link')} title="リンク">
            <LinkIcon size={18} />
        </FormatButton>
        <FormatButton onClick={addImage} title="画像">
            <ImageIcon size={18} />
        </FormatButton>
        <div className="h-6 border-l border-slate-300 dark:border-slate-600 mx-1"></div>

        {/* リスト */}
        <FormatButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="箇条書きリスト">
            <List size={18} />
        </FormatButton>
        <FormatButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="番号付きリスト">
            <ListOrdered size={18} />
        </FormatButton>
        <div className="h-6 border-l border-slate-300 dark:border-slate-600 mx-1"></div>

        {/* 引用、コードブロックなど */}
        <FormatButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="引用">
            <Quote size={18} />
        </FormatButton>
        <FormatButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} isActive={editor.isActive('codeBlock')} title="コードブロック">
            <Code size={18} />
        </FormatButton>
        <FormatButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="区切り線">
            <Minus size={18} />
        </FormatButton>
    </div>
  );
};

export default Toolbar;
