'use client';

import { useEffect, useState } from 'react';

export function StatusBadge() {
  const [status, setStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/health');
        if (res.ok) {
          setStatus('ok');
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    };

    checkStatus();
    // Optional: Poll every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (status === 'loading') {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
        <span className="w-2.5 h-2.5 rounded-full bg-gray-400"></span>
        检查中...
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-red-100 rounded-full text-sm font-medium text-red-600">
        <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
        服务异常
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-100 rounded-full text-sm font-medium text-green-600">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
      </span>
      正常运行中
    </div>
  );
}
