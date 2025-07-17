// app/dashboard/KigaNote/page.tsx
"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import LinkExtension from '@tiptap/extension-link';
import ImageExtension from '@tiptap/extension-image';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';

import Toolbar from './Toolbar';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import LoggedOutView from './LoggedOutView'; // LoggedOutViewコンポーネントをインポート
import { useKigaNote } from './hooks/useKigaNote';
const SaveIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);
const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-1">
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
    </svg>
);


const emptyContentJson = { type: "doc", content: [{ type: "paragraph" }] };

export default function KigaNotePage() {
    const router = useRouter();

    const editor = useEditor({
        extensions: [
            StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
            Underline,
            Placeholder.configure({ placeholder: 'ここに入力してください...' }),
            LinkExtension.configure({ openOnClick: true, autolink: true, linkOnPaste: true }),
            ImageExtension,
            TextStyle, Color,
            Highlight.configure({ multicolor: true }),
            Typography,
        ],
        content: emptyContentJson,
        editable: false,
        immediatelyRender: false,
        onUpdate: (props) => {
            // onUpdateはuseKigaNoteに移動したので、ここでは何もしないか、
            // 必要であればフックから返された関数を呼び出す。
            // ただし、useKigaNoteのonUpdateはeditorに依存しているので、
            // ここで直接呼び出すのは循環依存になる可能性がある。
            // そのため、useKigaNoteフック側でonUpdateを定義し、
            // editorのonUpdateプロパティでその関数を参照するようにする。
        },
    });

    const {
        notesList, currentNoteId, pageTitle, lastSaved,
        isLoading, isNoteLoading, isSaving, isDeleting,
        user, loaded,
        setPageTitle, handleSelectNote, handleCreateNewPage,
        handleSave, handleDelete, handleEditorUpdate,
    } = useKigaNote(editor);

    // onUpdateをフックから取得した関数で更新する
    useEffect(() => {
        if (editor && handleEditorUpdate) {
            editor.setOptions({
                onUpdate: handleEditorUpdate,
            });
        }
    }, [editor, handleEditorUpdate]);

    const scrollToKigaApps = () => { router.push('/dashboard#kiga-applications-section'); };

    useEffect(() => {
        if (editor) {
            // useKigaNoteフックにeditorインスタンスを渡す
            // このコンポーネントのロジックはuseKigaNoteに依存しているため、
            // editorが初期化された後にフックが正しく動作するようにする
        }
        return () => {
            editor?.destroy();
        };
    }, [editor]);

    // ... (JSX rendering part is unchanged)
    if (!loaded || (isLoading && !user)) { 
        return (
            <div className="flex h-screen items-center justify-center dark:bg-[#0F172A] text-gray-500 dark:text-gray-400">
                ワークスペースを読み込み中...
            </div>
        );
    }
    if (!user && loaded) {
        return <LoggedOutView scrollToKigaApps={scrollToKigaApps} />;
    }

    return (
        <div className="flex h-screen antialiased dark">
            <Sidebar
                notesList={notesList}
                currentNoteId={currentNoteId}
                isLoading={isLoading}
                isNoteLoading={isNoteLoading}
                isSaving={isSaving}
                isDeleting={isDeleting}
                user={user}
                handleSelectNote={handleSelectNote}
                handleCreateNewPage={handleCreateNewPage}
                scrollToKigaApps={scrollToKigaApps}
            />

            <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-[#0F172A] p-6 md:p-10">
                {(isNoteLoading || (isLoading && currentNoteId)) && (
                    <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400">
                        ノートを読み込み中...
                    </div>
                )}
                {editor && !isNoteLoading && !isLoading && currentNoteId && (
                    <>
                        <div className="flex justify-between items-center mb-6">
                            <input
                                type="text"
                                value={pageTitle}
                                onChange={(e) => setPageTitle(e.target.value)}
                                placeholder="無題のページ"
                                className="w-full text-3xl md:text-4xl font-bold bg-transparent dark:text-gray-100 focus:outline-none pb-2 border-b border-transparent dark:focus:border-slate-600 focus:border-slate-300 flex-grow"
                                disabled={isSaving || isDeleting || !editor?.isEditable}
                            />
                            <div className="flex items-center ml-4">
                                <button
                                    onClick={handleDelete}
                                    disabled={isSaving || isDeleting || !editor?.isEditable || notesList.length <= 1}
                                    className="mr-2 flex items-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-3 rounded-lg transition duration-200 disabled:opacity-50"
                                    title="現在のノートを削除"
                                >
                                    <TrashIcon /> {isDeleting && <span className="ml-1 text-xs">削除中</span>}
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || isDeleting || !editor?.isEditable}
                                    className="flex items-center bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
                                >
                                    <SaveIcon /> {isSaving ? "保存中..." : "Firebaseに保存"}
                                </button>
                            </div>
                        </div>
                        {lastSaved && (
                            <p className="text-xs text-gray-400 dark:text-slate-500 mb-4 text-right">
                                最終保存: {lastSaved.toLocaleString()}
                            </p>
                        )}
                        <Toolbar editor={editor} />
                        <div className="bg-white dark:bg-[#1E293B] p-1 rounded-lg shadow border dark:border-slate-700 ">
                            <EditorContent editor={editor} className="min-h-[60vh] prose dark:prose-invert max-w-none p-4 focus:outline-none" />
                        </div>
                    </>
                )}
                {editor && !isNoteLoading && !isLoading && !currentNoteId && notesList.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center text-gray-500 dark:text-gray-400">
                        <p className="text-xl mb-4">ノートがありません。</p>
                        <button
                            onClick={handleCreateNewPage}
                            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
                        >
                            最初のノートを作成する
                        </button>
                    </div>
                )}
            </main>

            <RightSidebar user={user} />
        </div>
    );
}
