'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronLeft, ChevronRight, MoreHorizontal, Plus, Loader2 } from 'lucide-react';

interface Quote {
  id: number;
  content: string;
  author: string | null;
  source: string | null;
  category: string | null;
  createdAt: string;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null);

  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importJson, setImportJson] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // Form states
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState('');
  const [jumpPage, setJumpPage] = useState('');

  const fetchQuotes = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/quotes?page=${page}&limit=${pagination.limit}`);
      if (res.ok) {
        const result = await res.json();
        // Handle both old format (array) and new format (object with data & pagination)
        // just in case of transition issues, though we updated the API.
        if (Array.isArray(result)) {
           setQuotes(result); // Fallback
        } else {
           setQuotes(result.data);
           setPagination(result.pagination);
        }
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
      toast.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.limit]);

  useEffect(() => {
    fetchQuotes(1);
  }, [fetchQuotes]);

  const handleImport = async () => {
    if (!importJson.trim()) {
      toast.error('请输入 JSON 数据');
      return;
    }

    try {
      setIsImporting(true);
      // Validate JSON
      let data;
      try {
        data = JSON.parse(importJson);
      } catch {
        toast.error('JSON 格式错误');
        setIsImporting(false);
        return;
      }

      const res = await fetch('/api/admin/quotes/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(`成功导入 ${result.count} 条数据`);
        setIsImportOpen(false);
        setImportJson('');
        fetchQuotes(1); // Refresh list
      } else {
        const err = await res.json();
        toast.error(`导入失败: ${err.message}`);
      }
    } catch (error) {
      console.error('Import error:', error);
      toast.error('导入出错');
    } finally {
      setIsImporting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchQuotes(newPage);
    }
  };

  const resetForm = () => {
    setContent('');
    setAuthor('');
    setSource('');
    setCategory('');
    setCurrentQuote(null);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, author, source, category }),
      });

      if (res.ok) {
        toast.success('添加成功');
        setIsAddOpen(false);
        resetForm();
        fetchQuotes(pagination.page); // Refresh current page
      } else {
        toast.error('添加失败');
      }
    } catch (error) {
      console.error('Error adding quote:', error);
      toast.error('添加失败');
    }
  };

  const handleEditClick = (quote: Quote) => {
    setCurrentQuote(quote);
    setContent(quote.content);
    setAuthor(quote.author || '');
    setSource(quote.source || '');
    setCategory(quote.category || '');
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentQuote) return;

    try {
      const res = await fetch(`/api/quotes/${currentQuote.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, author, source, category }),
      });

      if (res.ok) {
        toast.success('更新成功');
        setIsEditOpen(false);
        resetForm();
        fetchQuotes(pagination.page);
      } else {
        toast.error('更新失败');
      }
    } catch (error) {
      console.error('Error updating quote:', error);
      toast.error('更新失败');
    }
  };

  const handleJumpPage = () => {
    const page = parseInt(jumpPage);
    if (!isNaN(page) && page >= 1 && page <= pagination.totalPages) {
      handlePageChange(page);
      setJumpPage('');
    } else {
      toast.error(`请输入 1 到 ${pagination.totalPages} 之间的页码`);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条一言吗？')) return;

    try {
      const res = await fetch(`/api/quotes/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('删除成功');
        fetchQuotes(pagination.page);
      } else {
        toast.error('删除失败');
      }
    } catch (error) {
      console.error('Error deleting quote:', error);
      toast.error('删除失败');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">一言管理</h1>
        <div className="flex gap-2">
          <Dialog open={isImportOpen} onOpenChange={setIsImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                导入数据
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>批量导入一言数据</DialogTitle>
                <DialogDescription>
                  请粘贴 JSON 格式的数据数组。支持字段：id, uuid, hitokoto, type, from, from_who, length 等。
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="json-data">JSON 数据</Label>
                  <Textarea
                    id="json-data"
                    placeholder='[{"hitokoto": "...", "type": "a", ...}]'
                    className="h-[300px] font-mono text-xs"
                    value={importJson}
                    onChange={(e) => setImportJson(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsImportOpen(false)}>取消</Button>
                <Button onClick={handleImport} disabled={isImporting}>
                  {isImporting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  导入
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setContent('');
                setAuthor('');
                setCategory('');
              }}>
                <Plus className="mr-2 h-4 w-4" />
                添加一言
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>添加新一言</DialogTitle>
                <DialogDescription>
                  输入一言的内容、作者、来源和分类。
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSubmit}>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="content">内容</Label>
                    <Textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="author">作者</Label>
                      <Input
                        id="author"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="source">来源</Label>
                      <Input
                        id="source"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">分类</Label>
                      <Input
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">保存</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="rounded-md border bg-white dark:bg-gray-950">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">ID</TableHead>
              <TableHead className="w-[300px] md:w-[400px]">内容</TableHead>
              <TableHead className="w-[120px]">作者</TableHead>
              <TableHead className="w-[120px]">来源</TableHead>
              <TableHead className="w-[80px]">分类</TableHead>
              <TableHead className="w-[80px] text-right">操作</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="flex justify-center items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    加载中...
                  </div>
                </TableCell>
              </TableRow>
            ) : quotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  暂无数据
                </TableCell>
              </TableRow>
            ) : (
              quotes.map((quote) => (
                <TableRow key={quote.id}>
                  <TableCell>{quote.id}</TableCell>
                  <TableCell className="max-w-[300px] md:max-w-[400px]">
                    <div className="whitespace-pre-wrap break-all">
                      {quote.content}
                    </div>
                  </TableCell>
                  <TableCell>{quote.author || '-'}</TableCell>
                  <TableCell>{quote.source || '-'}</TableCell>
                  <TableCell>{quote.category || '-'}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">打开菜单</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>操作</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleEditClick(quote)}>
                          编辑
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDelete(quote.id)}
                        >
                          删除
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {!loading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>共 {pagination.total} 条</span>
            <span>第 {pagination.page} / {pagination.totalPages} 页</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 mr-4">
              <span className="text-sm text-muted-foreground">跳转至</span>
              <Input
                value={jumpPage}
                onChange={(e) => setJumpPage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleJumpPage();
                  }
                }}
                className="h-8 w-16 text-center"
                placeholder={pagination.page.toString()}
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleJumpPage}
              >
                Go
              </Button>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              上一页
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              下一页
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑一言</DialogTitle>
            <DialogDescription>
              修改一言的内容、作者、来源和分类。
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-content">内容</Label>
                <Textarea
                  id="edit-content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-author">作者</Label>
                  <Input
                    id="edit-author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-source">来源</Label>
                  <Input
                    id="edit-source"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="edit-category">分类</Label>
                  <Input
                    id="edit-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">保存修改</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
