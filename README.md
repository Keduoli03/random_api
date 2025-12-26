# Random API System (Next.js + Turso)

这是一个基于 Next.js 15 和 Turso (libSQL) 构建的轻量级随机 API 系统。提供随机一言（Quotes）和随机图片（Images）接口，并包含一个后台管理系统，提供一些基本的管理功能。

## ✨ 主要功能

### 🚀 公共 API
*   **随机一言**: 获取一条随机的语录/名言。支持按分类、长度筛选。
*   **随机图片**: 获取一张随机图片。支持按横屏/竖屏筛选。

### 🛡️ 后台管理 (Admin Dashboard)
*   **安全认证**: 基于 Cookie 的管理员登录验证。
*   **一言管理**:
    *   CRUD 操作（增删改查）。
    *   批量导入 JSON 数据。
    *   分页浏览与跳转。
*   **数据统计**: 实时查看 API 调用次数、资源总量统计。
*   **图片同步**: 自动扫描本地图片目录并同步元数据到数据库。

## 🛠️ 技术栈
*   **框架**: [Next.js 15 (App Router)](https://nextjs.org/)
*   **语言**: TypeScript
*   **数据库**: [Turso (libSQL)](https://turso.tech/)
*   **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
*   **UI 组件**: [shadcn/ui](https://ui.shadcn.com/) 
*   **样式**: [Tailwind CSS v4](https://tailwindcss.com/)

## 🚀 快速开始

### 1. fork本项目到vercel

### 2. 数据库配置
1. 登录 [Turso](https://turso.tech/) 并创建一个新数据库。
2. 复制数据库 URL 和 Auth Token。(Vercel可一键链接)

### 3. 配置环境变量

配置用户名和密码

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=password
```

### 4. 数据库迁移

初始化数据库表结构：

```bash
npm run db:push
```

### 5. 启动开发服务器


## 📂 项目结构

```
├── app/
│   ├── api/            # API 路由 (quotes, images, health, auth)
│   ├── admin/          # 后台管理页面
│   ├── data/           # 本地资源存储 (Images)
│   └── ...
├── components/         # UI 组件 (shadcn)
├── db/                 # 数据库配置 (Schema, Connection)
├── lib/                # 工具函数 (auth, stats, etc.)
├── scripts/            # 脚本 (db sync)
└── public/             # 静态资源
```

## 📝 API 文档

### 随机一言
- **URL**: `/api/quotes/random`
- **Method**: `GET`
- **Params**:
    - `c`: 分类 (e.g., `a`=动画, `b`=漫画, etc.)
    - `min_length`: 最小长度
    - `max_length`: 最大长度

### 随机图片
- **URL**: `/api/images/random`
- **Method**: `GET`
- **Params**:
    - `type`: 图片方向 (`h`=横屏, `v`=竖屏)

## 📜 许可证

MIT License
