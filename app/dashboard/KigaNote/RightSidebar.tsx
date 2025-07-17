// app/dashboard/KigaNote/RightSidebar.tsx
"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/store/user';

const BellIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
);

interface RightSidebarProps {
    user: User | null;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ user }) => {
    const router = useRouter();

    const handleProfileClick = () => {
        router.push('/dashboard/profile');
    };

    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        const target = e.target as HTMLImageElement;
        target.onerror = null;
        target.src = '/default-icon.png';
        target.alt = user?.name?.charAt(0) || "?";
    };

    return (
        <aside className="w-16 bg-slate-100 dark:bg-[#0F172A] p-3 flex flex-col items-center space-y-5 shadow-lg border-l dark:border-slate-700">
            <button className="p-2 mt-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 focus:outline-none transition-colors duration-200">
                <BellIcon />
            </button>
            <button
                onClick={handleProfileClick}
                className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 flex items-center justify-center"
                title={user?.name || "プロフィール"}
            >
                {user?.photoURL ? (
                    <img
                        src={user.photoURL}
                        alt={user.name || "User"}
                        className="w-full h-full object-cover"
                        onError={handleImageError}
                    />
                ) : (
                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">
                        {user?.name?.charAt(0).toUpperCase() || "?"}
                    </span>
                )}
            </button>
        </aside>
    );
};

export default RightSidebar;
