// app/dashboard/KigaNote/LoggedOutView.tsx
"use client";

import React from 'react';
import Link from 'next/link';

const KigaLogoIcon = () => (
    <svg className="w-5 h-5 mr-2 text-white" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
        <path d="M6.99999 5.00003L14 12.0001L6.99999 19V5.00003Z M15 5H20V19H15V5Z"></path>
    </svg>
);

const Squares2X2Icon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-3">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 15.75V18a2.25 2.25 0 01-2.25 2.25h-2.25a2.25 2.25 0 01-2.25-2.25v-2.25z" />
    </svg>
);

interface LoggedOutViewProps {
    scrollToKigaApps: () => void;
}

const LoggedOutView: React.FC<LoggedOutViewProps> = ({ scrollToKigaApps }) => {
    return (
        <div className="flex h-screen antialiased dark">
            <aside className="w-64 bg-gradient-to-b from-purple-600 to-pink-600 text-white p-5 flex flex-col shadow-2xl">
                <div className="flex items-center mb-6 pt-2">
                    <KigaLogoIcon />
                    <div>
                        <span className="text-xl font-bold tracking-tight">Kiga Workspace</span>
                        <p className="text-xs text-purple-200 opacity-90 font-medium">Key Intelligence Gateway for Advancement</p>
                    </div>
                </div>
                <div className="border-t border-white/20 my-4"></div>
                <nav className="space-y-1">
                    <Link href="/dashboard" className="flex items-center py-2.5 px-3 rounded-lg transition duration-200 hover:bg-white/10">
                        <span className="text-sm font-medium">ダッシュボード</span>
                    </Link>
                </nav>
                <div className="border-t border-white/20 my-4"></div>
                <div className="space-y-1 flex-grow overflow-y-auto pr-1">
                    <h3 className="px-3 pt-2 pb-1 text-xs font-semibold text-purple-200 uppercase tracking-wider">KIGANOTE</h3>
                    <p className="px-3 text-sm text-purple-200 opacity-70">ログインしてください</p>
                </div>
                <div className="mt-auto pt-2">
                    <button onClick={scrollToKigaApps} className="flex w-full items-center py-2.5 px-3 rounded-lg transition duration-200 hover:bg-white/10 dark:hover:bg-white/20 text-left">
                        <Squares2X2Icon />
                        <span className="text-sm font-medium">アプリ一覧へ</span>
                    </button>
                    <div className="border-t border-white/20 my-4"></div>
                    <div className="pb-2">
                        <p className="text-xs text-center text-purple-200 opacity-70">© 2024 Kiga Workspace</p>
                    </div>
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto bg-slate-100 dark:bg-[#0F172A] p-6 md:p-10 flex items-center justify-center">
                <p className="text-xl text-gray-500 dark:text-gray-400">KigaNoteを利用するにはログインしてください。</p>
            </main>
            <aside className="w-16 bg-slate-100 dark:bg-[#0F172A] p-3 flex flex-col items-center space-y-5 shadow-lg border-l dark:border-slate-700"></aside>
        </div>
    );
};

export default LoggedOutView;
