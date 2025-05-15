// app/dashboard/page.tsx (または任意のパスの page.tsx)
"use client";

import React from 'react';

// globals.css に以下の様な定義が必要です:
// body {
//     font-family: 'M PLUS Rounded 1c', sans-serif;
//     background-color: #f7f3ff;
// }
// .header-gradient {
//     background-image: linear-gradient(to right, #8B5CF6, #EC4899);
// }
// .search-bar-custom {
//     background-color: rgba(255, 255, 255, 0.2);
// }
// .card-hover-effect {
//     transition: all 0.3s ease-out;
// }
// .card-hover-effect:hover {
//     transform: translateY(-5px) scale(1.02);
//     box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.08);
// }
// .button-pop {
//     transition: all 0.2s ease-in-out;
//     box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
// }
// .button-pop:hover {
//     transform: translateY(-2px);
//     box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
// }
// .icon-bg-pop-blue { background-color: #DBEAFE; color: #3B82F6; }
// .icon-bg-pop-purple { background-color: #EDE9FE; color: #8B5CF6; }
// .icon-bg-pop-green { background-color: #D1FAE5; color: #10B981; }
// .kiga-logo-icon {
//     width: 32px;
//     height: 32px;
//     fill: currentColor;
// }
//
// また、M PLUS Rounded 1c フォントは app/layout.tsx で読み込むのが推奨されます。例:
// import { M_PLUS_Rounded_1c } from 'next/font/google';
// const mplusRounded1c = M_PLUS_Rounded_1c({ subsets: ['latin'], weight: ['400', '500', '700', '800'] });
// <body className={mplusRounded1c.className}>...</body>

export default function KigaSpacePage() {

    const handleCardClick = (e: React.MouseEvent<HTMLDivElement>, appName: string, type: 'page' | 'spreadsheet' | 'calendar') => {
        const target = e.target as HTMLElement;
        const isButtonClicked = target.tagName === 'BUTTON' || target.closest('button');

        if (isButtonClicked) {
            alert(`${appName}を開きます（ボタン）`);
        } else {
            alert(`${appName}に移動します（カード全体）`);
        }
    };

    return (
        <>
            {/* Header */}
            <header className="header-gradient text-white shadow-lg">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex items-center">
                        <svg className="kiga-logo-icon mr-3" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.99999 5.00003L14 12.0001L6.99999 19V5.00003Z M15 5H20V19H15V5Z"></path>
                        </svg>
                        <div>
                            <span className="text-3xl font-extrabold tracking-tight">KIGA workspace</span>
                            <p className="text-xs text-indigo-100 opacity-90 font-medium">Key Intelligence Gateway for Advancement</p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative flex-grow max-w-lg mx-6">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input type="text" placeholder="検索..." className="w-full search-bar-custom text-white placeholder-gray-100 rounded-full py-2.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all duration-300" />
                    </div>

                    {/* Icons */}
                    <div className="flex items-center space-x-5">
                        <button className="p-2 rounded-full hover:bg-white hover:bg-opacity-20 focus:outline-none focus:bg-white focus:bg-opacity-20 transition-colors duration-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                        </button>
                        <button className="w-10 h-10 bg-pink-400 text-white rounded-full flex items-center justify-center font-bold text-lg focus:outline-none hover:bg-pink-500 transition-colors duration-200 shadow-md">
                            ユ
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-12">
                <div className="mb-12 text-center">
                    <h2 className="text-4xl font-extrabold text-gray-800 mb-3">こんにちは、ユーザーさん 👋</h2>
                    <p className="text-lg text-gray-600">今日も素晴らしい一日にしましょう。あなたのワークスペースへようこそ！</p>
                </div>

                {/* Main Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
                    {/* Notion-style Page Card */}
                    <div 
                        id="notion-card" 
                        onClick={(e) => handleCardClick(e, 'Notion風ページ', 'page')}
                        className="card-hover-effect bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 cursor-pointer">
                        <div className="p-8">
                            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl mb-6 shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">Notion風ページ</h3>
                            <p className="text-gray-600 mb-6 text-sm">メモ、ドキュメント、ナレッジベースを整理して管理します。</p>
                            <button className="button-pop w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-300">
                                開く ✨
                            </button>
                        </div>
                    </div>

                    {/* Spreadsheet Card */}
                    <div 
                        id="spreadsheet-card" 
                        onClick={(e) => handleCardClick(e, 'スプレッドシート', 'spreadsheet')}
                        className="card-hover-effect bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 cursor-pointer">
                        <div className="p-8">
                            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl mb-6 shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">スプレッドシート</h3>
                            <p className="text-gray-600 mb-6 text-sm">データを整理、分析、視覚化するためのデータベース。</p>
                            <button className="button-pop w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-300">
                                開く 📊
                            </button>
                        </div>
                    </div>

                    {/* Calendar Card */}
                    <div 
                        id="calendar-card" 
                        onClick={(e) => handleCardClick(e, 'カレンダー', 'calendar')}
                        className="card-hover-effect bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200 cursor-pointer">
                        <div className="p-8">
                            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl mb-6 shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-3">カレンダー</h3>
                            <p className="text-gray-600 mb-6 text-sm">予定やイベントを管理し、効率的にスケジュールを立てます。</p>
                            <button className="button-pop w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold py-3 px-4 rounded-xl transition duration-300">
                                開く 📅
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">最近のアクティビティ</h3>
                    <div className="space-y-6">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full icon-bg-pop-blue flex items-center justify-center mr-4 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-800 font-semibold">プロジェクト計画書を編集しました</p>
                                <p className="text-gray-500 text-sm">今日 10:23</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full icon-bg-pop-purple flex items-center justify-center mr-4 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-800 font-semibold">チームミーティングを予定しました</p>
                                <p className="text-gray-500 text-sm">昨日 15:45</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full icon-bg-pop-green flex items-center justify-center mr-4 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-gray-800 font-semibold">四半期レポートを完成させました</p>
                                <p className="text-gray-500 text-sm">2日前</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Access */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-12 border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">クイックアクセス</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        <button className="button-pop flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-slate-100 rounded-xl transition duration-300 border border-slate-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span className="text-gray-700 font-semibold">新規作成</span>
                        </button>
                        <button className="button-pop flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-slate-100 rounded-xl transition duration-300 border border-slate-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span className="text-gray-700 font-semibold">テンプレート</span>
                        </button>
                        <button className="button-pop flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-slate-100 rounded-xl transition duration-300 border border-slate-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                            </svg>
                            <span className="text-gray-700 font-semibold">アーカイブ</span>
                        </button>
                        <button className="button-pop flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-slate-100 rounded-xl transition duration-300 border border-slate-200">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-sky-500 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-gray-700 font-semibold">設定</span>
                        </button>
                    </div>
                </div>

                {/* KIGA Applications Section */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">KIGA applications</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* KigaErs Button */}
                        <a href="https://kiga-ers-web.vercel.app/" target="_blank" rel="noopener noreferrer"
                           className="button-pop flex flex-col items-center justify-start p-6 bg-gradient-to-br from-sky-400 to-blue-600 hover:from-sky-500 hover:to-blue-700 text-white rounded-2xl transition duration-300 shadow-lg h-full">
                            <div className="mb-4 p-3 bg-white bg-opacity-20 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 text-white">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold mt-1">KigaErs</span>
                            <span className="text-sm text-center mt-2 opacity-90 leading-tight">新しい論文との出会いを、もっと直観的に</span>
                        </a>
                        {/* KigaE Button */}
                        <a href="https://kiga-e.vercel.app/" target="_blank" rel="noopener noreferrer"
                           className="button-pop flex flex-col items-center justify-start p-6 bg-gradient-to-br from-rose-400 to-pink-600 hover:from-rose-500 hover:to-pink-700 text-white rounded-2xl transition duration-300 shadow-lg h-full">
                            <div className="mb-4 p-3 bg-white bg-opacity-20 rounded-xl">
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 text-white">
                                   <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M5.834 19.834l-1.591-1.591M3.75 10.5H6m13.065-5.172l-1.591-1.591M9.166 4.666l1.591-1.591M18 13.5V12m-1.515 2.455l1.591-1.591M5.834 4.666l1.591 1.591M4.5 13.5H6M9.166 19.834l1.591 1.591" />
                                 </svg>
                            </div>
                            <span className="text-xl font-bold mt-1">KigaE</span>
                            <span className="text-sm text-center mt-2 opacity-90 leading-tight">あなたもレバーでお気持ち表現</span>
                        </a>
                        {/* KigaSeek Button */}
                        <a href="https://bio-seek.vercel.app/" target="_blank" rel="noopener noreferrer"
                           className="button-pop flex flex-col items-center justify-start p-6 bg-gradient-to-br from-teal-400 to-cyan-600 hover:from-teal-500 hover:to-cyan-700 text-white rounded-2xl transition duration-300 shadow-lg h-full">
                             <div className="mb-4 p-3 bg-white bg-opacity-20 rounded-xl">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-10 h-10 text-white">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 9.75L16.5 12l-2.25 2.25m-4.5 0L7.5 12l2.25-2.25M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
                                </svg>
                            </div>
                            <span className="text-xl font-bold mt-1">KigaSeek</span>
                            <span className="text-sm text-center mt-2 opacity-90 leading-tight">生物研究者の必須ツール</span>
                        </a>
                    </div>
                </div>
            </main>
        </>
    );
}