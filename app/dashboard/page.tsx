// app/dashboard/page.tsx (または該当するページのパス)
"use client";

import React from 'react';

// 仮のSVGアイコンコンポーネント
const KigaLogoIcon = () => (
    <svg
        className="w-5 h-5 mr-2 text-white" // サイズを小さく (例: w-5 h-5)
        viewBox="0 0 28 28"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
    >
        <path d="M6.99999 5.00003L14 12.0001L6.99999 19V5.00003Z M15 5H20V19H15V5Z"></path>
    </svg>
);

const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

const Squares2X2Icon = () => ( // アプリ一覧用アイコンの例
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
);


export default function KigaSpacePage() {

    const handleCardClick = (e: React.MouseEvent<HTMLDivElement>, appName: string) => {
        const target = e.target as HTMLElement;
        const isButtonClicked = target.tagName === 'BUTTON' || target.closest('button');

        if (isButtonClicked) {
            alert(`${appName}を開きます（ボタン）`);
        } else {
            alert(`${appName}に移動します（カード全体）`);
        }
    };

    const scrollToKigaApps = () => {
        const section = document.getElementById('kiga-applications-section');
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        // ダークモードを有効にするためにルート要素に 'dark' クラスを適用
        <div className="flex h-screen antialiased dark"> {/* <<< 'dark' クラスをここに適用 */}
            {/* Left Sidebar */}
            <aside className="w-64 bg-gradient-to-b from-purple-600 to-pink-600 text-white p-5 flex flex-col shadow-2xl">
                {/* Logo and Title Area */}
                <div className="flex items-center mb-6 pt-2">
                    <KigaLogoIcon />
                    <div>
                        <span className="text-xl font-bold tracking-tight">Kiga Workspace</span> {/* タイトル変更 */}
                        <p className="text-xs text-purple-200 opacity-90 font-medium">
                            Key Intelligence Gateway for Advancement
                        </p>
                    </div>
                </div>

                <div className="border-t border-white/20 my-4"></div> {/* 区切り線 */}

                {/* Navigation Area */}
                <nav className="space-y-1">
                    <a href="#" className="flex items-center py-2.5 px-3 rounded-lg transition duration-200 bg-white/10 dark:hover:bg-white/20">
                        <span className="text-sm font-medium">ダッシュボード</span>
                    </a>
                    <a href="#" className="flex items-center py-2.5 px-3 rounded-lg transition duration-200 hover:bg-white/10 dark:hover:bg-white/20">
                        <span className="text-sm font-medium">設定</span>
                    </a>
                </nav>

                <div className="border-t border-white/20 my-4"></div> {/* 区切り線 */}

                {/* App List Button Area - Placed towards the bottom */}
                <div className="mt-auto"> {/* mt-autoで下部にプッシュ */}
                     <button
                        onClick={scrollToKigaApps}
                        className="flex w-full items-center py-2.5 px-3 rounded-lg transition duration-200 hover:bg-white/10 dark:hover:bg-white/20 text-left"
                    >
                        <Squares2X2Icon />
                        <span className="text-sm font-medium">アプリ一覧</span>
                    </button>
                    <div className="border-t border-white/20 my-4"></div> {/* 区切り線 */}
                    <div className="pb-2">
                       <p className="text-xs text-center text-purple-200 opacity-70">© 2024 Kiga Workspace</p>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            {/* ダークモードの背景色を画像に合わせて調整 (例: #0f172a or a custom darker blue-gray) */}
            <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-[#0F172A]">
                <div className="container mx-auto px-6 py-8 md:px-10">
                    <div className="mb-10 text-center">
                        <h2 className="text-4xl font-extrabold text-gray-800 dark:text-gray-100 mb-3">
                            こんにちは、ユーザーさん 👋
                        </h2>
                        <p className="text-lg text-gray-500 dark:text-gray-400">
                            今日も素晴らしい一日にしましょう。あなたのワークスペースへようこそ！
                        </p>
                    </div>

                    {/* Main Cards */}
                    {/* ダークモードのカード背景色を画像に合わせて調整 (例: #1e293b) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        <div
                            id="notion-card"
                            onClick={(e) => handleCardClick(e, 'Notion風ページ')}
                            className="card-hover-effect bg-white dark:bg-[#1E293B] rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700 cursor-pointer"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl mb-5 shadow-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Notion風ページ</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-5 text-sm">メモ、ドキュメント、ナレッジベースを整理して管理します。</p>
                                <button className="button-pop w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300">
                                    開く ✨
                                </button>
                            </div>
                        </div>

                        <div
                            id="spreadsheet-card"
                            onClick={(e) => handleCardClick(e, 'スプレッドシート')}
                            className="card-hover-effect bg-white dark:bg-[#1E293B] rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700 cursor-pointer"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl mb-5 shadow-md">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">スプレッドシート</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-5 text-sm">データを整理、分析、視覚化するためのデータベース。</p>
                                <button className="button-pop w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300">
                                    開く 📊
                                </button>
                            </div>
                        </div>

                        <div
                            id="calendar-card"
                            onClick={(e) => handleCardClick(e, 'カレンダー')}
                            className="card-hover-effect bg-white dark:bg-[#1E293B] rounded-2xl shadow-lg overflow-hidden border border-gray-200 dark:border-slate-700 cursor-pointer"
                        >
                            <div className="p-8">
                                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl mb-5 shadow-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">カレンダー</h3>
                                <p className="text-gray-500 dark:text-gray-400 mb-5 text-sm">予定やイベントを管理し、効率的にスケジュールを立てます。</p>
                                <button className="button-pop w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300">
                                    開く 📅
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl p-8 mb-12 border border-gray-200 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-5">最近のアクティビティ</h3>
                        <div className="space-y-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mr-3 shadow-sm">
                                   <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-700 dark:text-gray-200 font-medium text-sm">プロジェクト計画書を編集しました</p>
                                    <p className="text-gray-400 dark:text-gray-500 text-xs">今日 10:23</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mr-3 shadow-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-700 dark:text-gray-200 font-medium text-sm">チームミーティングを予定しました</p>
                                    <p className="text-gray-400 dark:text-gray-500 text-xs">昨日 15:45</p>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 flex items-center justify-center mr-3 shadow-sm">
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-gray-700 dark:text-gray-200 font-medium text-sm">四半期レポートを完成させました</p>
                                    <p className="text-gray-400 dark:text-gray-500 text-xs">2日前</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access */}
                    <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl p-8 mb-12 border border-gray-200 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-5">クイックアクセス</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
                            <button className="button-pop flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition duration-300 border border-slate-200 dark:border-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500 dark:text-purple-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">新規作成</span>
                            </button>
                             <button className="button-pop flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition duration-300 border border-slate-200 dark:border-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-500 dark:text-pink-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">テンプレート</span>
                            </button>
                            <button className="button-pop flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition duration-300 border border-slate-200 dark:border-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-emerald-500 dark:text-emerald-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                                <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">アーカイブ</span>
                            </button>
                            <button className="button-pop flex flex-col items-center justify-center p-5 bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition duration-300 border border-slate-200 dark:border-slate-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-sky-500 dark:text-sky-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                   <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">設定</span>
                            </button>
                        </div>
                    </div>

                    {/* KIGA Applications Section */}
                    <div id="kiga-applications-section" className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-700">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-5">KIGA applications</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <a href="https://kiga-ers-web.vercel.app/" target="_blank" rel="noopener noreferrer"
                               className="button-pop flex flex-col items-center justify-start p-6 bg-gradient-to-br from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white rounded-xl transition duration-300 shadow-lg h-full">
                                <div className="mb-3 p-2.5 bg-white/20 dark:bg-white/10 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-white">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                    </svg>
                                </div>
                                <span className="text-lg font-bold">KigaErs</span>
                                <span className="text-xs text-center mt-1.5 opacity-90 leading-snug">新しい論文との出会いを、もっと直観的に</span>
                            </a>
                            <a href="https://kiga-e.vercel.app/" target="_blank" rel="noopener noreferrer"
                               className="button-pop flex flex-col items-center justify-start p-6 bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white rounded-xl transition duration-300 shadow-lg h-full">
                                <div className="mb-3 p-2.5 bg-white/20 dark:bg-white/10 rounded-lg">
                                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-white">
                                       <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M5.834 19.834l-1.591-1.591M3.75 10.5H6m13.065-5.172l-1.591-1.591M9.166 4.666l1.591-1.591M18 13.5V12m-1.515 2.455l1.591-1.591M5.834 4.666l1.591 1.591M4.5 13.5H6M9.166 19.834l1.591 1.591" />
                                     </svg>
                                </div>
                                <span className="text-lg font-bold">KigaE</span>
                                <span className="text-xs text-center mt-1.5 opacity-90 leading-snug">あなたもレバーでお気持ち表現</span>
                            </a>
                            <a href="https://bio-seek.vercel.app/" target="_blank" rel="noopener noreferrer"
                               className="button-pop flex flex-col items-center justify-start p-6 bg-gradient-to-br from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white rounded-xl transition duration-300 shadow-lg h-full">
                                 <div className="mb-3 p-2.5 bg-white/20 dark:bg-white/10 rounded-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-8 h-8 text-white">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                                    </svg>
                                </div>
                                <span className="text-lg font-bold">KigaSeek</span>
                                <span className="text-xs text-center mt-1.5 opacity-90 leading-snug">生物研究者の必須ツール</span>
                            </a>
                        </div>
                    </div>
                </div>
            </main>

            {/* Right Sidebar */}
            {/* ダークモードの右サイドバー背景色を調整 (例: #11141D or #0F172A) */}
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