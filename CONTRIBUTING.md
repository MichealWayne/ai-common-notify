# 项目开发指南

本文档旨在帮助开发者快速了解如何在本地环境中设置、开发、调试和测试 AI Common Notify 项目。

## 目录

1. [项目结构](#项目结构)
2. [开发环境设置](#开发环境设置)
3. [本地开发](#本地开发)
4. [开发工作流](#开发工作流)
5. [调试](#调试)
6. [测试](#测试)
7. [构建与打包](#构建与打包)
8. [代码规范](#代码规范)
9. [提交代码](#提交代码)

## 项目结构

```
ai-common-notify/
├── src/                  # TypeScript 源代码
│   ├── cli/              # 命令行接口
│   ├── core/             # 核心模块
│   ├── handlers/         # 外部事件处理器
│   ├── utils/            # 工具类
│   └── index.ts          # 程序入口
├── test/                 # 测试文件
├── dist/                 # 编译后的 JavaScript 文件
├── docs/                 # 文档
├── package.json          # 项目配置和依赖
├── tsconfig.json         # TypeScript 配置
├── jest.config.js        # Jest 测试配置
└── README.md             # 项目说明
```

## 开发环境设置

### 系统要求

- Node.js 16 或更高版本
- npm 8 或更高版本
- Git

### 安装依赖

1. 克隆项目仓库：
   ```bash
   git clone https://github.com/yourusername/ai-common-notify.git
   cd ai-common-notify
   ```

2. 安装项目依赖：
   ```bash
   npm install
   ```

## 本地开发

### 启动开发服务器

在开发过程中，您可以使用 `ts-node` 直接运行 TypeScript 文件，而无需先编译：

```bash
npm run dev
```

这将直接运行 `src/index.ts` 文件。

### 编译项目

要将 TypeScript 代码编译为 JavaScript，请运行：

```bash
npm run build
```

编译后的文件将位于 `dist/` 目录中。

## 开发工作流

1. 创建功能分支：
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. 进行代码更改

3. 运行测试确保没有破坏现有功能：
   ```bash
   npm test
   ```

4. 编译项目确保没有 TypeScript 错误：
   ```bash
   npm run build
   ```

5. 提交更改并推送到远程仓库

## 调试

### 使用 VS Code 调试

项目包含了 VS Code 的调试配置。要在 VS Code 中调试：

1. 打开项目根目录
2. 设置断点
3. 按 `F5` 或点击"运行与调试"面板中的"启动程序"

### 使用 Chrome DevTools 调试

您也可以使用 Chrome DevTools 调试 Node.js 应用：

1. 在代码中添加 `debugger;` 语句或设置断点
2. 运行以下命令：
   ```bash
   node --inspect-brk dist/index.js
   ```
3. 在 Chrome 浏览器中打开 `chrome://inspect`
4. 点击"inspect"链接开始调试

### 日志调试

项目中使用 `console.log` 和 `console.error` 来输出调试信息。在生产环境中，这些日志可能会被重定向到文件或专门的日志系统。

## 测试

### 运行测试

项目使用 Jest 作为测试框架。要运行所有测试：

```bash
npm test
```

### 运行测试并监听文件变化

在开发过程中，您可以运行以下命令来自动重新运行测试：

```bash
npm run test:watch
```

### 运行测试并生成覆盖率报告

要生成测试覆盖率报告：

```bash
npm run test:coverage
```

### 编写测试

测试文件位于 `test/` 目录中，文件名格式为 `*.test.ts`。请为新功能或修复的 bug 编写相应的测试。

## 构建与打包

### 构建项目

将 TypeScript 代码编译为 JavaScript：

```bash
npm run build
```

### 打包为独立可执行文件

将项目打包为独立可执行文件（支持 Windows、macOS 和 Linux）：

```bash
npm run package
```

打包后的可执行文件将位于项目根目录中。

## 代码规范

### TypeScript/JavaScript

项目使用 TypeScript 编写，遵循以下规范：

1. 使用 2 个空格缩进
2. 使用单引号而不是双引号
3. 语句末尾不使用分号
4. 使用 camelCase 命名变量和函数
5. 使用 PascalCase 命名类和接口
6. 为所有公共函数和类编写 JSDoc 注释

### 提交信息

提交信息应遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat:` 新功能
- `fix:` 修复 bug
- `chore:` 构建过程或辅助工具的变动
- `docs:` 文档更新
- `style:` 代码格式调整（不影响代码运行）
- `refactor:` 代码重构
- `test:` 测试相关代码
- `perf:` 性能优化

示例：
```
feat: 添加新的 MCP 服务器功能
fix: 修复 Claude 钩子处理中的错误
docs: 更新 README.md 文件
```

## 提交代码

1. 确保所有测试通过：
   ```bash
   npm test
   ```

2. 确保代码能够成功编译：
   ```bash
   npm run build
   ```

3. 提交代码到您的分支：
   ```bash
   git add .
   git commit -m "您的提交信息"
   git push origin feature/your-feature-name
   ```

4. 在 GitHub 上创建 Pull Request

## 发布新版本

要发布新版本：

1. 更新 `package.json` 中的版本号
2. 运行 `npm run build` 确保代码能正确编译
3. 运行 `npm run test` 确保所有测试通过
4. 运行 `npm run package` 生成新的可执行文件
5. 提交更改并创建新的 Git 标签
6. 将新版本推送到 npm 仓库：
   ```bash
   npm publish
   ```

## 获取帮助

如果您在开发过程中遇到任何问题，请：

1. 查看现有 issue 和 PR
2. 在 GitHub 上创建新的 issue
3. 联系项目维护者