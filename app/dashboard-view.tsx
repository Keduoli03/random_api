'use client';

import { useState, useEffect } from 'react';

interface Stats {
  quotes: number;
  images: {
    h: number;
    v: number;
    total: number;
  };
  usage: {
    total: number;
    quotes: number;
    images: number;
    images_h?: number;
    images_v?: number;
  };
}

export function DashboardView() {
  const [stats, setStats] = useState<Stats | null>(null);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    // Initial stats fetch
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Quotes Card */}
        <a 
          href="/api/quotes/random" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all hover:shadow-md relative overflow-hidden group cursor-pointer h-full flex flex-col"
        >
          <div className="absolute top-0 right-0 p-4">
            <span className="text-6xl">📝</span>
          </div>
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </div>
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">一言总数</h3>
          <p className="text-5xl font-black text-gray-900 mt-4 tracking-tight">
            {stats ? stats.quotes : '-'}
          </p>
          <div className="mt-auto pt-4 text-xs text-gray-400">
            已收录 (点击访问接口)
          </div>
        </a>
        
        {/* Images Card */}
        <a 
          href="/api/images/random" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all hover:shadow-md relative overflow-hidden group cursor-pointer h-full flex flex-col"
        >
          <div className="absolute top-0 right-0 p-4">
            <span className="text-6xl">🖼️</span>
          </div>
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
            </svg>
          </div>
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">图片总数</h3>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-black text-gray-900 tracking-tight">
              {stats ? stats.images.total : '-'}
            </span>
          </div>
          <div className="mt-auto pt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-2 py-1 rounded">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>横屏: {stats ? stats.images.h : '-'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-2 py-1 rounded">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>竖屏: {stats ? stats.images.v : '-'}</span>
            </div>
          </div>
        </a>

        {/* Usage Stats Card */}
        <div className="p-6 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition-colors relative overflow-hidden group h-full flex flex-col lg:col-span-2">
          <div className="absolute top-0 right-0 p-4">
             <span className="text-6xl">📊</span>
          </div>
          <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wider">接口调用次数</h3>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-5xl font-black text-gray-900 tracking-tight">
              {stats ? stats.usage.total : '-'}
            </span>
          </div>
          <div className="mt-auto pt-4 flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-2 py-1 rounded">
              <span>一言: {stats ? stats.usage.quotes : '-'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-2 py-1 rounded">
              <span>图片: {stats ? stats.usage.images : '-'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-2 py-1 rounded">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>横屏: {stats?.usage.images_h || 0}</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-2 py-1 rounded">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>竖屏: {stats?.usage.images_v || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
