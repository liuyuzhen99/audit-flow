# TransFlow Frontend / TransFlow 前端

## English

TransFlow Frontend is a Next.js dashboard for operating a translation and media audit workflow. It helps reviewers monitor artists, review candidate videos, track processing jobs, and inspect accepted library assets from one web interface.

The app lives in [`auditflow-app`](./auditflow-app) and is designed to work with a backend API that exposes artist, queue, pipeline, report, and library endpoints.

## 中文

TransFlow 前端是一个基于 Next.js 的翻译与媒体审核工作台，用于帮助审核人员在同一个 Web 界面中监控艺人、审核候选视频、跟踪处理任务，并查看已验收的资源。

应用代码位于 [`auditflow-app`](./auditflow-app)，设计上通过后端 API 获取艺人、审核队列、处理流水线、报告和资源库等数据。

## Features / 功能

- Artist monitoring dashboard with search, status filters, sorting, pagination, and candidate counts.  
  艺人监控看板，支持搜索、状态筛选、排序、分页和候选数量展示。
- Audit queue for reviewing pending candidates and navigating into active workflow details.  
  审核队列，用于处理待审核候选项，并跳转到当前工作流详情。
- Pipeline view for tracking candidate processing stages and worker execution status.  
  流水线视图，用于跟踪候选项处理阶段和 worker 执行状态。
- Library view for accepted assets, ready previews, missing-artifact states, and asset detail pages.  
  资源库视图，用于查看已验收资源、可预览产物、缺失产物状态和资源详情页。
- Report detail UI with timeline, rule hits, and reviewer comments.  
  报告详情页，包含时间线、规则命中和审核评论。
- Local mock API routes for frontend development and tests.  
  内置本地 mock API 路由，便于前端开发和测试。
- Typed API boundaries with Zod schemas, adapters, and TypeScript domain models.  
  使用 Zod schema、适配器和 TypeScript 领域模型管理类型化 API 边界。

## Tech Stack / 技术栈

- Next.js 16 with the App Router
- React 19
- TypeScript
- Tailwind CSS 4
- SWR for client-side data refresh / SWR 用于客户端数据刷新
- Zod for response validation / Zod 用于响应校验
- Vitest and Testing Library for unit and component tests / Vitest 与 Testing Library 用于单元测试和组件测试
- ESLint for static checks / ESLint 用于静态检查

## Project Structure / 项目结构

```text
vibeFrontTranslation/
+-- auditflow-app/          # Next.js application / Next.js 应用
|   +-- src/app/            # App Router pages and API proxy routes / 页面与 API 代理路由
|   +-- src/components/     # Shared layout, UI, and feature components / 共享布局、UI 与功能组件
|   +-- src/lib/            # API clients, adapters, schemas, mocks, utilities / API 客户端、适配器、schema、mock 与工具
|   +-- src/types/          # Shared TypeScript types / 共享 TypeScript 类型
|   +-- docs/               # Architecture notes and validation checklists / 架构说明与验证清单
+-- prototype/              # Product prototype screenshots / 产品原型截图
```

## Getting Started / 快速开始

### Prerequisites / 前置要求

- Node.js 20 or later / Node.js 20 或更高版本
- npm
- A running backend API, unless you only need mock-route or component-level development  
  一个运行中的后端 API；如果只做 mock 路由或组件级开发，则不是必须。

### Install Dependencies / 安装依赖

```bash
cd vibeFrontTranslation/auditflow-app
npm install
```

### Configure the Backend / 配置后端

The frontend proxies backend requests through Next.js API routes. By default it calls:

前端通过 Next.js API 路由代理后端请求。默认后端地址为：

```text
http://127.0.0.1:8000
```

To use a different backend, set `RANDY_TRANSLATION_API_BASE_URL`:

如需使用其他后端地址，请设置 `RANDY_TRANSLATION_API_BASE_URL`：

```bash
RANDY_TRANSLATION_API_BASE_URL=http://127.0.0.1:8000 npm run dev
```

For local development, you can also place the variable in an untracked `.env.local` file inside `auditflow-app`.

本地开发时，也可以在 `auditflow-app` 下创建未纳入版本控制的 `.env.local` 文件来配置该变量。

### Run the App / 启动应用

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The root route redirects to `/artists`.

打开 [http://localhost:3000](http://localhost:3000)。根路由会自动跳转到 `/artists`。

## Available Scripts / 可用脚本

Run these commands from `vibeFrontTranslation/auditflow-app`:

请在 `vibeFrontTranslation/auditflow-app` 目录下运行以下命令：

```bash
npm run dev        # Start the local development server / 启动本地开发服务器
npm run build      # Create a production build / 创建生产构建
npm run start      # Start the production server / 启动生产服务器
npm run lint       # Run ESLint / 运行 ESLint
npm run typecheck  # Run TypeScript without emitting files / 运行 TypeScript 类型检查
npm run test       # Run the Vitest test suite / 运行 Vitest 测试
npm run test:watch # Run Vitest in watch mode / 以 watch 模式运行 Vitest
```

## Main Routes / 主要路由

- `/artists` - artist sync health, channel resolution, and candidate discovery.  
  艺人同步健康状态、频道解析和候选发现。
- `/artists/[artistId]` - candidate list for a selected artist.  
  指定艺人的候选列表。
- `/queue` - candidate review queue with approve/reject workflow entry points.  
  候选审核队列，包含通过和拒绝等工作流入口。
- `/pipeline` - processing status and workflow stage details.  
  处理状态和工作流阶段详情。
- `/library` - accepted asset list and artifact readiness.  
  已验收资源列表和产物就绪状态。
- `/library/[assetId]` - asset preview and download detail.  
  资源预览和下载详情。
- `/reports/[reportId]` - audit report detail, timeline, rule hits, and comments.  
  审核报告详情、时间线、规则命中和评论。

## Development Notes / 开发说明

- Keep backend-facing DTOs in `src/types` and validate external responses through schemas in `src/lib/schemas`.  
  面向后端的 DTO 放在 `src/types`，外部响应通过 `src/lib/schemas` 中的 schema 校验。
- Convert API DTOs into UI-ready view models in `src/lib/adapters`.  
  在 `src/lib/adapters` 中将 API DTO 转换为适合 UI 使用的视图模型。
- Shared table, pagination, search, status, and empty/error/loading components live in `src/components/shared`.  
  表格、分页、搜索、状态，以及空态、错误态、加载态等共享组件位于 `src/components/shared`。
- Feature-specific UI belongs under `src/components/features`.  
  功能模块专属 UI 放在 `src/components/features`。
- Tests are colocated with the modules they cover using `*.test.ts` or `*.test.tsx`.  
  测试文件与被测试模块放在同级目录，命名为 `*.test.ts` 或 `*.test.tsx`。

## Quality Checks / 质量检查

Before opening a pull request, run:

提交 pull request 前建议运行：

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

## License / 许可证

No license has been declared yet. Add a license file before publishing if you want others to reuse, modify, or distribute this project.

当前尚未声明许可证。如果希望他人复用、修改或分发该项目，请在公开发布前添加许可证文件。
