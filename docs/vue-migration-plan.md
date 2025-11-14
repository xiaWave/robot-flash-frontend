## Vue 重写实施计划

### 目标
- 使用 Vue 3 + Vite + TypeScript 重写现有 React 前端。
- 复用视觉样式（Tailwind v4、自定义主题变量）与交互布局，做到像素级一致。
- 保留现有数据契约、API/WebSocket 协议与业务逻辑，逐步迁移功能模块。

### 总体步骤
1. **脚手架与基础依赖**
   - 使用 `npm create vue@latest` 在仓库中新建 `frontend-vue/`（或其他约定目录）。
   - 选择 TypeScript、Vue Router、Pinia、Vitest（可选）模板。
   - 安装依赖：`@tanstack/vue-query`, `axios`, `tailwindcss@next`, `postcss`, `autoprefixer`, `lucide-vue-next`, `radix-vue`, `shadcn-vue`, `@vueuse/core`, `zustand` 等等（针对需要）。
   - 将 `frontend/src/index.css` 复制为 Vue 项目的 `src/assets/tailwind.css`，调整全局导入路径。

2. **工程配置**
   - 配置 Tailwind v4（`tailwind.config.ts`）与 PostCSS；确保 CSS 变量、@layer 块保留。
   - 在 `main.ts` 中注册 `VueQueryPlugin`、`createPinia()`、`router`，与 React 版本的 `StrictMode + QueryClientProvider + BrowserRouter` 对齐。
   - 设置 `tsconfig` 路径别名（如 `@/components`）以便迁移 TS 类型。

3. **通用数据层迁移**
   - 将 `frontend/src/services` 下的 `apiClient.ts`, `httpClient.ts`, `types.ts`, `websocket.ts` 迁移到 `frontend-vue/src/services`，保留 TypeScript 类型。
   - 组合式封装：`useApiClient`, `useWebSocket`, `useCrud`、`useApiQueries` 等，以 `@tanstack/vue-query` 提供者连接。
   - 把 `types/`、`utils/` 复制并按需调整为 Vue 环境通用模块。

4. **状态管理**
   - 使用 Pinia 重写 `authStore`, `taskStore`，确保 getter/setter 与现有逻辑一致（`setUser`, `logout`, `currentTask` 等）。
   - 可选：利用 Zustand 的 API 直接在 Vue 内使用，但推荐迁移到 Pinia 以便生态一致。

5. **UI 组件库迁移**
   - 引入 `shadcn-vue`（或自建 Radix 组件）生成 `components/ui/*`，命名及 props 仿照 React 版本。
   - 组件按优先级迁移：
     1. Button / Card / Dialog / Form / Table 等基础。
     2. Sidebar、NotificationSystem、KeyboardShortcutsHelp、LoadingSpinner 等业务公用组件。
     3. DataTable、FormDialog、DeleteConfirmDialog 等复合组件。
   - 对于不存在的 Vue 组件，手动将 JSX 模板转换为 `<template>` + `<script setup>` 并保留 Tailwind 类名。

6. **路由与布局**
   - 创建 `src/router/index.ts`，定义与 React 相同的路由表（`/login`, `/flash`, `/tasks`, `/resources`, `/versions`, `/records`）。
   - 实现 `AppLayout.vue`（含 `Sidebar` + `AppTopBar` + `<router-view>`）以及 `AuthGuard`（在 `router.beforeEach` 中读取 `authStore.currentUser`）。
   - `AppTopBar`：使用 `useRoute()` 生成面包屑，`onMounted` + `setInterval` 更新时钟，引用 `KeyboardShortcutsHelp` 组件。

7. **页面迁移顺序**
   1. `LoginPage`：优先实现以便验证 auth 流程。
   2. `FlashDevicePage` & `FlashDevice` 相关组件。
   3. `TaskManagementPage`, `ResourceTypePage`, `VersionManagementPage`, `FlashRecordsPage`。
   4. 公共对话框、表格、Pagination 等工具组件。
   5. 其余 `features/`、`guidelines/` 中涉及的 UI。

8. **交互与辅助功能**
   - 键盘快捷键：使用 `@vueuse/core` 的 `useMagicKeys` 或原生事件，实现 `KeyboardShortcutsHelp` 与 `FloatingShortcutHelp`。
   - 通知：可用 `sonner` 的 Vue 版本或 `@vueuse/headlessui` 实现；保持与原 UX 一致。
   - 性能监控、ErrorBoundary：利用 Vue 的 `defineExpose` + `app.config.errorHandler` 以及 `onErrorCaptured`。

9. **验证与对齐**
   - 每完成一个页面，与 React 版本同时运行，对比 UI（手动截图或 `Playwright` 视觉回归）。
   - 复用 API mock/真实后端进行冒烟测试，重点验证刷机流程、任务流、版本发布等关键路径。
   - 使用 E2E（Playwright/Cypress）或 Vitest 组件测试确保关键组件的行为。

10. **交付与切换**
    - 在 `package.json` 中新增并行脚本，如 `dev:react`, `dev:vue`，方便双端对比。
    - 当 Vue 版本功能齐平后，更新 CI/CD 构建流程以选择性部署 Vue 前端。
    - 逐步废弃 React 目录，保留文档与版本标签以便回溯。

### 后续行动
- 依据本计划创建 `frontend-vue/` 架构，提交初版脚手架。
- 以页面/组件为单位迭代迁移，持续同步文档记录差异与已完成范围。


