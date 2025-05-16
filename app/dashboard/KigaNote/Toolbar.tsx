// app/dashboard/KigaNote/Toolbar.tsx
"use client";

import React from 'react';
import { Editor } from '@tiptap/react';
import {
    Bold, Italic, Underline, Strikethrough, Heading1, Heading2, Heading3,
    List, ListOrdered, Quote, Code, Link as LinkIcon, Image as ImageIcon, Minus, Pilcrow, Palette, CaseSensitive // アイコンの例 (Lucide Reactなどから)
} from 'lucide-react'; // Lucide Reactを使用する場合 (npm install lucide-react)
// またはHeroiconsなど
// import { BoldIcon as HeroBoldIcon, ... } from '@heroicons/react/24/outline';


interface ToolbarProps {
  editor: Editor | null;
}

const Toolbar: React.FC<ToolbarProps> = ({ editor }) => {
  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) return; // キャンセル
    if (url === '') { // 空文字ならリンク解除
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
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
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-slate-200 dark:bg-slate-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        title="見出し1"
      >
        <Heading1 size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-slate-200 dark:bg-slate-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        title="見出し2"
      >
        <Heading2 size={18} />
      </button>
       <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-slate-200 dark:bg-slate-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        title="見出し3"
      >
        <Heading3 size={18} />
      </button>
      <div className="h-6 border-l border-slate-300 dark:border-slate-600 mx-1"></div>

      {/* 太字、イタリック、下線、取り消し線 */}
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded ${editor.isActive('bold') ? 'bg-slate-200 dark:bg-slate-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        title="太字"
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded ${editor.isActive('italic') ? 'bg-slate-200 dark:bg-slate-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        title="イタリック"
      >
        <Italic size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded ${editor.isActive('underline') ? 'bg-slate-200 dark:bg-slate-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        title="下線"
      >
        <Underline size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-2 rounded ${editor.isActive('strike') ? 'bg-slate-200 dark:bg-slate-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        title="取り消し線"
      >
        <Strikethrough size={18} />
      </button>
      <div className="h-6 border-l border-slate-300 dark:border-slate-600 mx-1"></div>

      {/* 文字色・背景色 (Tiptap Color, Highlight 拡張機能が必要) */}
      <input
          type="color"
          onInput={event => editor.chain().focus().setColor((event.target as HTMLInputElement).value).run()}
          value={editor.getAttributes('textStyle').color || '#000000'}
          className="w-8 h-8 p-0 border-none rounded bg-transparent cursor-pointer"
          title="文字色"
      />
      <button
        onClick={() => editor.chain().focus().toggleHighlight({ color: '#FFF3A3' }).run()} // 黄色の例
        className={`p-2 rounded ${editor.isActive('highlight', { color: '#FFF3A3' }) ? 'bg-yellow-200 dark:bg-yellow-700' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        title="背景ハイライト"
      >
        <Palette size={18} /> {/* より適切なアイコンに置き換え */}
      </button>
      <div className="h-6 border-l border-slate-300 dark:border-slate-600 mx-1"></div>

      {/* リンク */}
      <button
        onClick={setLink}
        className={`p-2 rounded ${editor.isActive('link') ? 'bg-slate-200 dark:bg-slate-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        title="リンク"
      >
        <LinkIcon size={18} />
      </button>
      {/* 画像 (Tiptap Image 拡張機能が必要) */}
      <button onClick={addImage} className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700" title="画像">
        <ImageIcon size={18} />
      </button>
      <div className="h-6 border-l border-slate-300 dark:border-slate-600 mx-1"></div>


      {/* リスト */}
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-slate-200 dark:bg-slate-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        title="箇条書きリスト"
      >
        <List size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-slate-200 dark:bg-slate-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        title="番号付きリスト"
      >
        <ListOrdered size={18} />
      </button>
      <div className="h-6 border-l border-slate-300 dark:border-slate-600 mx-1"></div>

      {/* 引用、コードブロックなど (StarterKitに含まれる) */}
      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded ${editor.isActive('blockquote') ? 'bg-slate-200 dark:bg-slate-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        title="引用"
      >
        <Quote size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={`p-2 rounded ${editor.isActive('codeBlock') ? 'bg-slate-200 dark:bg-slate-600' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}`}
        title="コードブロック"
      >
        <Code size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        className="p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
        title="区切り線"
      >
        <Minus size={18} />
      </button>

      {/* 他にも多くのボタンを追加可能... */}
    </div>
  );
};

export default Toolbar;