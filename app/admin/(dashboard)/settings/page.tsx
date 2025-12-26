'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function SettingsPage() {
  const [imagePrefix, setImagePrefix] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'done' | 'error'>('idle');

  useEffect(() => {
    // Fetch current settings
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const data = await response.json();
          setImagePrefix(data.imagePrefix || '');
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
        toast.error('无法加载设置');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSyncImages = async () => {
    setSyncStatus('syncing');
    try {
      const res = await fetch('/api/sync-images', { method: 'POST' });
      if (res.ok) {
        setSyncStatus('done');
        const data = await res.json();
        toast.success(`同步完成: 新增 ${data.stats.added}, 删除 ${data.stats.deleted}, 总计 ${data.stats.total}`);
        setTimeout(() => setSyncStatus('idle'), 3000);
      } else {
        setSyncStatus('error');
        toast.error('同步失败');
      }
    } catch (error) {
      console.error('Error syncing images:', error);
      setSyncStatus('error');
      toast.error('同步出错');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imagePrefix }),
      });

      if (response.ok) {
        toast.success('设置已保存');
      } else {
        toast.error('保存失败');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-6">
      <Card>
        <CardHeader>
          <CardTitle>系统设置</CardTitle>
          <CardDescription>
            管理系统全局配置
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="imagePrefix">图片 URL 前缀 (CDN 加速)</Label>
              <Input
                id="imagePrefix"
                placeholder="https://cdn.example.com"
                value={imagePrefix}
                onChange={(e) => setImagePrefix(e.target.value)}
              />
              <p className="text-sm text-gray-500">
                设置后，API 返回的图片 URL 将使用此域名作为前缀。
                <br />
                例如：<code>https://cdn.example.com/images/h/pic.jpg</code>
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                保存设置
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>数据同步</CardTitle>
          <CardDescription>
            手动扫描文件系统并同步图片数据库
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">图片库存同步</p>
              <p className="text-sm text-gray-500">
                扫描 <code>app/data/Image</code> 目录，更新数据库记录。
              </p>
            </div>
            <Button 
              onClick={handleSyncImages} 
              disabled={syncStatus === 'syncing'}
              variant="secondary"
            >
              {syncStatus === 'syncing' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  同步中...
                </>
              ) : syncStatus === 'done' ? (
                '同步完成'
              ) : (
                '开始同步'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
