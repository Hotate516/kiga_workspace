// app/dashboard/KigaNote/page.tsx
"use client";

import React, { useState } from 'react';
import Link from 'next/link'; // Next.jsのLinkコンポーネントを使用

// アイコンコンポーネント (親ダッシュボードから流用または別途定義)
const KigaLogoIcon = () => (
    <svg
        className="w-5 h-5 mr-2 text-white"
        viewBox="0 0 28 28"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
    >
        <path d="M6.99999 5.00003L14 12.0001L6.99999 19V5.00003Z M15 5H20V19H15V5Z"></path>
    </svg>
);

const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const Squares2X2Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);

// Notion風エディタで使うアイコンのダミー
const TypeIcon = () => <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.293 3.293a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L10 5.414 5.707 9.707a1 1 0 01-1.414-1.414l5-5z" clipRule="evenodd" /></svg>;
const ListOrderedIcon = () => <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4a1 1 0 000 2h10a1 1 0 100-2H5zm0 4a1 1 0 100 2h10a1 1 0 100-2H5zm0 4a1 1 0 100 2h4a1 1 0 100-2H5z" clipRule="evenodd" /></svg>;
const ListBulletIcon = () => <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 5a1 1 0 000 2h10a1 1 0 100-2H5zm0 4a1 1 0 100 2h10a1 1 0 100-2H5zm0 4a1 1 0 100 2h4a1 1 0 100-2H5z" clipRule="evenodd" /></svg>;
const BoldIcon = () => <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 4.5A2.5 2.5 0 016.5 2H10a2.5 2.5 0 012.5 2.5v.5a.5.5 0 001 0v-.5A3.5 3.5 0 0010 1H6.5A3.5 3.5 0 003 4.5v11A3.5 3.5 0 006.5 19H10a3.5 3.5 0 003.5-3.5v-.5a.5.5 0 00-1 0v.5a2.5 2.5 0 01-2.5 2.5H6.5A2.5 2.5 0 014 15.5v-11zm7.5 2a.5.5 0 000-1H9.062A1.5 1.5 0 007.562 7H7.5a.5.5 0 000 1h.062a1.5 1.5 0 001.438 1.5H11.5a.5.5 0 000-1H9.062A1.5 1.5 0 007.562 8H7.5a.5.5 0 000-1h.062A1.5 1.5 0 009.062 5.5H11.5z" clipRule="evenodd" /></svg>;


export default function KigaNotePage() {
    const [pageTitle, setPageTitle] = useState<string>("無題のページ");
    const [pageContent, setPageContent] = useState<string>(""); // textareaで管理する簡易コンテンツ

    const scrollToKigaApps = () => {
        // 親のダッシュボードページに移動してからスクロールする想定 (今回はダミー)
        alert("親ダッシュボードのアプリ一覧にスクロールします (KigaNote内からは直接制御不可)");
        // もし同じページ内にあれば:
        // const section = document.getElementById('kiga-applications-section');
        // if (section) {
        //     section.scrollIntoView({ behavior: 'smooth' });
        // }
    };

    return (
        <div className="flex h-screen antialiased dark">
            {/* Left Sidebar */}
            <aside className="w-64 bg-gradient-to-b from-purple-600 to-pink-600 text-white p-5 flex flex-col shadow-2xl">
                <div className="flex items-center mb-6 pt-2">
                    <KigaLogoIcon />
                    <div>
                        <span className="text-xl font-bold tracking-tight">Kiga Workspace</span>
                        <p className="text-xs text-purple-200 opacity-90 font-medium">
                            Key Intelligence Gateway for Advancement
                        </p>
                    </div>
                </div>

                <div className="border-t border-white/20 my-4"></div>

                <nav className="space-y-1">
                    <Link href="/dashboard" legacyBehavior>
                        <a className="flex items-center py-2.5 px-3 rounded-lg transition duration-200 hover:bg-white/10">
                            <span className="text-sm font-medium">ダッシュボード</span>
                        </a>
                    </Link>
                    {/* <Link href="/dashboard/settings" legacyBehavior>
                        <a className="flex items-center py-2.5 px-3 rounded-lg transition duration-200 hover:bg-white/10">
                            <span className="text-sm font-medium">設定</span>
                        </a>
                    </Link> */}
                </nav>

                <div className="border-t border-white/20 my-4"></div>

                {/* KigaNote Specific Section */}
                <div className="space-y-2">
                    <h3 className="px-3 text-xs font-semibold text-purple-200 uppercase tracking-wider">KigaNote</h3>
                    <span
                        className="flex items-center py-2.5 px-3 rounded-lg bg-white/20 cursor-default" // アクティブなページ風
                    >
                        {/* <DocumentTextIcon className="w-5 h-5 mr-3" /> */}
                        <span className="text-sm font-medium truncate">{pageTitle || "現在のページ"}</span>
                    </span>
                    <button
                        className="flex w-full items-center py-2.5 px-3 rounded-lg transition duration-200 hover:bg-white/10 text-left"
                        onClick={() => alert("新規ページ作成 (機能未実装)")}
                    >
                        {/* <PlusCircleIcon className="w-5 h-5 mr-3" /> */}
                        <span className="text-sm font-medium">新規ページ作成</span>
                    </button>
                </div>


                <div className="mt-auto">
                     <button
                        onClick={scrollToKigaApps}
                        className="flex w-full items-center py-2.5 px-3 rounded-lg transition duration-200 hover:bg-white/10 text-left"
                    >
                        <Squares2X2Icon />
                        <span className="text-sm font-medium">アプリ一覧へ</span>
                    </button>
                    <div className="border-t border-white/20 my-4"></div>
                    <div className="pb-2">
                       <p className="text-xs text-center text-purple-200 opacity-70">© 2024 Kiga Workspace</p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area for KigaNote */}
            <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-[#0F172A] p-6 md:p-10">
                {/* Page Title Input */}
                <input
                    type="text"
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    placeholder="無題のページ"
                    className="w-full text-3xl md:text-4xl font-bold bg-transparent dark:text-gray-100 focus:outline-none mb-6 pb-2 border-b border-transparent dark:focus:border-slate-600 focus:border-slate-300"
                />

                {/* Simplified Toolbar */}
                <div className="flex items-center space-x-2 mb-4 p-2 bg-white dark:bg-[#1E293B] rounded-lg shadow border dark:border-slate-700">
                    <button className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 dark:text-gray-300" title="見出し1"><TypeIcon /></button>
                    <button className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 dark:text-gray-300" title="番号付きリスト"><ListOrderedIcon /></button>
                    <button className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 dark:text-gray-300" title="箇条書きリスト"><ListBulletIcon /></button>
                    <button className="p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-600 dark:text-gray-300" title="太字"><BoldIcon /></button>
                    {/* 他のツールボタンを追加 */}
                </div>

                {/* Content Editing Area (Placeholder) */}
                <div className="prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert max-w-none bg-white dark:bg-[#1E293B] p-6 rounded-lg shadow border dark:border-slate-700 min-h-[60vh]">
                    {/* 
                      ここにTiptapなどのリッチテキストエディタを将来的に組み込む。
                      現状はtextareaで簡易的な入力を模倣。
                    */}
                    <textarea
                        value={pageContent}
                        onChange={(e) => setPageContent(e.target.value)}
                        placeholder="ここに入力してください... (テキスト、見出し、リストなど)"
                        className="w-full h-full min-h-[50vh] p-0 bg-transparent focus:outline-none resize-none dark:text-gray-300 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                    {/* 
                      Tiptap導入時のイメージ:
                      <EditorContent editor={editor} />
                    */}
                     <div className="mt-8">
                        <h2 className="text-2xl font-semibold dark:text-gray-200">Notion風ブロックの例</h2>
                        <p className="dark:text-gray-400">これは通常のテキストブロックです。</p>
                        <h3 className="text-xl font-semibold mt-4 dark:text-gray-300">これは見出しブロックです</h3>
                        <ul className="list-disc pl-5 mt-2 space-y-1 dark:text-gray-400">
                            <li>箇条書きリストの項目1</li>
                            <li>箇条書きリストの項目2</li>
                        </ul>
                        <ol className="list-decimal pl-5 mt-2 space-y-1 dark:text-gray-400">
                            <li>番号付きリストの項目1</li>
                            <li>番号付きリストの項目2</li>
                        </ol>
                    </div>
                </div>
            </main>

            {/* Right Sidebar */}
            <aside className="w-16 bg-slate-100 dark:bg-[#0F172A] p-3 flex flex-col items-center space-y-5 shadow-lg border-l dark:border-slate-700">
                 <button className="p-2 mt-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none transition-colors duration-200">
                    <BellIcon />
                </button>
                <button className="w-9 h-9 bg-pink-500 dark:bg-pink-600 text-white rounded-full flex items-center justify-center font-bold text-base focus:outline-none hover:bg-pink-600 dark:hover:bg-pink-700 transition-colors duration-200 shadow-md">
                    ユ
                </button>
            </aside>
        </div>
    );
}