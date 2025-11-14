# 🚀 机器刷机系统 - 快速开始指南

## 📋 系统要求

- Node.js 16+
- npm 或 yarn
- 现代浏览器 (Chrome 90+, Firefox 88+, Safari 14+)

## ⚡ 快速启动

### 1. 安装依赖
```bash
npm install
```

### 2. 启动开发服务器
```bash
npm run dev
```

### 3. 访问应用
打开浏览器访问 `http://localhost:5173`

### 4. 登录系统
- 用户名: `admin`
- 密码: `admin`

## 🎯 核心功能模块

### 1. 刷机操作 (`/flash`)
- 设备连接验证
- 固件版本选择
- 实时刷机进度
- 日志实时显示

### 2. 任务管理 (`/tasks`)
- 任务列表查看
- 任务详情展示
- 任务控制 (暂停/恢复/取消)
- 实时状态更新

### 3. 资源类型 (`/resources`)
- 软件资源管理
- 系统配置管理
- 设备固件管理
- 分类筛选功能

### 4. 版本管理 (`/versions`)
- 版本列表管理
- 固件文件上传
- 版本信息编辑
- 文件下载功能

### 5. 刷机记录 (`/records`)
- 历史记录查看
- 操作日志详情
- 状态筛选
- 数据导出功能

## 🛠️ 开发工具和功能

### 性能监控
在开发环境中，右下角会显示"性能监控"按钮，点击可查看：
- 实时FPS监控
- 内存使用情况
- 组件渲染统计
- 网络请求状态

### 错误处理
- 全局错误边界保护
- 详细的错误信息显示
- 自动错误恢复机制
- 开发环境错误堆栈

### 通知系统
- 操作成功/失败提示
- 实时状态更新通知
- 可自定义的通知类型
- 自动消失机制

## 🎨 UI组件特性

### 响应式设计
- 支持桌面端和平板端
- 自适应布局
- 触摸友好的交互

### 主题系统
- 浅色/深色主题切换
- 自定义主题色彩
- 一致的设计语言

### 交互优化
- 防抖搜索输入
- 虚拟化长列表
- 智能加载状态
- 平滑的过渡动画

## 📊 数据管理

### 状态管理
- Zustand 轻量级状态管理
- 持久化用户设置
- 智能的状态更新
- 开发工具集成

### API集成
- 模块化API设计
- 自动错误处理
- 请求/响应拦截
- 类型安全的接口

### 数据缓存
- React Query 数据缓存
- 智能数据同步
- 离线数据支持
- 后台更新机制

## 🔧 自定义配置

### 环境变量
创建 `.env.local` 文件：
```env
VITE_API_BASE_URL=http://localhost:3000
VITE_WS_URL=ws://localhost:3001
VITE_APP_TITLE=机器刷机系统
```

### 主题配置
在 `src/styles/theme.ts` 中自定义：
```typescript
export const theme = {
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    // ...
  }
};
```

## 🧪 测试指南

### 单元测试
```bash
npm run test
```

### E2E测试
```bash
npm run test:e2e
```

### 类型检查
```bash
npm run type-check
```

## 📈 性能优化建议

### 开发时
- 使用性能监控面板
- 关注组件渲染次数
- 检查内存使用情况
- 优化图片和资源

### 生产部署
- 启用Gzip压缩
- 配置CDN加速
- 设置缓存策略
- 监控性能指标

## 🐛 常见问题解决

### 开发环境问题
**Q: 端口被占用怎么办？**
A: 修改 `vite.config.ts` 中的端口号配置

**Q: 样式不生效？**
A: 检查 Tailwind CSS 配置和类名

**Q: API请求失败？**
A: 确认后端服务是否正常运行

### 性能问题
**Q: 页面加载慢？**
A: 检查网络请求和资源大小

**Q: 列表滚动卡顿？**
A: 确认是否使用了虚拟化列表

**Q: 内存占用高？**
A: 检查是否有内存泄漏和未清理的定时器

## 📚 学习资源

### 技术文档
- [React 官方文档](https://react.dev)
- [TypeScript 手册](https://www.typescriptlang.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zustand 文档](https://zustand.docs.pmnd.rs)

### 最佳实践
- [React 性能优化](https://react.dev/learn/render-and-commit)
- [TypeScript 最佳实践](https://typescript-eslint.io/rules/)
- [组件设计模式](https://react.dev/learn/passing-props-to-a-component)

## 🤝 贡献指南

### 代码提交规范
```bash
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建工具或辅助工具的变动
```

### 开发流程
1. Fork 项目
2. 创建功能分支
3. 提交代码变更
4. 创建 Pull Request
5. 代码审查
6. 合并主分支

## 📞 获取帮助

- 📧 技术支持: support@example.com
- 📖 项目文档: [docs/](./docs)
- 🐛 问题反馈: [Issues](https://github.com/your-repo/issues)
- 💬 讨论交流: [Discussions](https://github.com/your-repo/discussions)

---

**Happy Coding! 🎉**