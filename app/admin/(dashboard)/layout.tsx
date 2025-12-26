'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { LogOut, LayoutDashboard, Settings } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('已退出登录');
        router.push('/admin/login');
        router.refresh();
      } else {
        toast.error('退出失败');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('退出失败');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-6 dark:bg-gray-950 shadow-sm">
        <Link href="/admin/quotes" className="flex items-center gap-2 font-semibold">
          <LayoutDashboard className="h-6 w-6" />
          <span className="">后台管理系统</span>
        </Link>
        <div className="flex items-center gap-4 ml-6">
           <Link href="/admin/quotes">
             <Button variant="ghost" size="sm">
                一言管理
             </Button>
           </Link>
           <Link href="/admin/settings">
             <Button variant="ghost" size="sm">
                <Settings className="mr-2 h-4 w-4" />
                系统设置
             </Button>
           </Link>
        </div>
        <Link href="/">
          <Button variant="ghost" size="sm">
            返回首页
          </Button>
        </Link>
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">管理员</span>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            退出
          </Button>
        </div>
      </header>
      <main className="p-6">
        {children}
      </main>
    </div>
  );
}
