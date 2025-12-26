import { DashboardView } from "./dashboard-view";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cookies } from "next/headers";
import { StatusBadge } from "./status-badge";

export default async function Page() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.has('admin_session');

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center pt-8 px-4 gap-4">
        <div className="text-center md:text-left">
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <h1 className="text-3xl font-black tracking-tight text-gray-900">随机 API 控制台</h1>
            <StatusBadge />
          </div>
          <p className="text-gray-500 mt-1">
            管理一言和图片资源。
          </p>
        </div>
        <div>
          {isLoggedIn ? (
            <Link href="/admin/quotes">
              <Button variant="outline">进入后台</Button>
            </Link>
          ) : (
            <Link href="/login">
              <Button variant="ghost">管理员登录</Button>
            </Link>
          )}
        </div>
      </div>
      
      <DashboardView />

      <div className="grid gap-6 md:grid-cols-2 mt-10">
        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold leading-none tracking-tight">一言 API</h3>
            <p className="text-sm text-muted-foreground">随机返回一条语录</p>
          </div>
          <div className="p-6 pt-0 space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">接口地址</div>
              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold block overflow-x-auto">
                GET /api/quotes/random
              </code>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">参数说明</div>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li><code className="text-xs bg-gray-100 px-1 rounded">c</code>: <span className="text-gray-500">分类 (a:动画, b:漫画, c:游戏, d:文学, e:原创, f:来自网络, g:其他, h:影视, i:诗词, j:网易云, k:哲学, l:抖机灵)</span></li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">min_length</code>: <span className="text-gray-500">最小字数 (例如: 10)</span></li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">max_length</code>: <span className="text-gray-500">最大字数 (例如: 20)</span></li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">调用示例</div>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 font-mono text-xs">
                <li><a href="/api/quotes/random?c=a" target="_blank" className="text-blue-600 hover:underline">/api/quotes/random?c=a</a> <span className="text-gray-500 font-sans">(获取动画类语录)</span></li>
                <li><a href="/api/quotes/random?min_length=10&max_length=20" target="_blank" className="text-blue-600 hover:underline">/api/quotes/random?min_length=10&max_length=20</a> <span className="text-gray-500 font-sans">(字数限制)</span></li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">返回示例</div>
              <pre className="rounded bg-muted p-4 overflow-x-auto text-xs">
{`{
  "id": 1,
  "content": "生活明朗，万物可爱",
  "author": "佚名",
  "source": "网络",
  ...
}`}
              </pre>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold leading-none tracking-tight">随机图片 API</h3>
            <p className="text-sm text-muted-foreground">随机返回一张精美图片</p>
          </div>
          <div className="p-6 pt-0 space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">接口地址</div>
              <code className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold block overflow-x-auto">
                GET /api/images/random
              </code>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">参数说明</div>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                <li><code className="text-xs bg-gray-100 px-1 rounded">type</code>: <span className="text-gray-500">h (横屏) | v (竖屏)</span></li>
                <li><code className="text-xs bg-gray-100 px-1 rounded">return</code>: <span className="text-gray-500">json (返回JSON数据) | path (同json)</span></li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">调用示例</div>
              <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 font-mono text-xs">
                <li><a href="/api/images/random?type=h" target="_blank" className="text-blue-600 hover:underline">/api/images/random?type=h</a> <span className="text-gray-500 font-sans">(获取横屏图片)</span></li>
                <li><a href="/api/images/random?return=json" target="_blank" className="text-blue-600 hover:underline">/api/images/random?return=json</a> <span className="text-gray-500 font-sans">(返回 JSON 格式)</span></li>
              </ul>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium">返回示例 (return=json)</div>
              <pre className="rounded bg-muted p-4 overflow-x-auto text-xs">
{`{
  "url": "https://...",
  "width": 1920,
  "height": 1080,
  "type": "h"
}`}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
