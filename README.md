# AI丛刊

一个基于 Next.js 的 AI 生成文章投稿平台。

## 功能特点

- GitHub 账号登录
- 文章投稿和审核
- Markdown 支持
- 数学公式渲染
- 响应式设计

## 本地开发

1. 克隆仓库
```bash
git clone https://github.com/your-username/ai-weekly-journal.git
cd ai-weekly-journal
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
复制 `.env.example` 文件为 `.env.local`，并填写必要的环境变量：
```bash
cp .env.example .env.local
```

4. 启动开发服务器
```bash
npm run dev
```

## 部署到 Vercel

1. Fork 本仓库到你的 GitHub 账号

2. 在 Vercel 中导入项目
   - 访问 [Vercel](https://vercel.com)
   - 点击 "New Project"
   - 选择你 fork 的仓库
   - 配置环境变量
   - 点击 "Deploy"

3. 配置 GitHub OAuth
   - 在 GitHub 中创建 OAuth App
   - 设置回调 URL 为你的 Vercel 域名
   - 更新 Vercel 环境变量中的 GITHUB_ID 和 GITHUB_SECRET

## 技术栈

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- NextAuth.js
- React Markdown
- KaTeX

## 许可证

MIT

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
