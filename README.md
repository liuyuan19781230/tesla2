# TSLA 0DTE Decision Dashboard

这是一个 TSLA 0DTE 期权决策平台 MVP Demo。

第一版目标：

- 展示 TSLA 0DTE 决策仪表盘
- 用模拟数据演示「做 / 不做 / Call / Put / 仓位 / 止损」
- 后续可以接入真实行情、期权链、Options Flow、新闻事件和账户风控

> 注意：本项目仅用于产品原型和教育演示，不构成投资建议。

---

## 本地运行

先安装 Node.js：

https://nodejs.org/

然后在项目目录运行：

```bash
npm install
npm run dev
```

浏览器打开终端显示的网址，一般是：

```bash
http://localhost:5173
```

---

## 打包

```bash
npm run build
```

打包后的文件在 `dist` 文件夹。

---

## 部署到 GitHub Pages

### 方法一：最简单，使用 Vercel

1. 注册或登录 Vercel：https://vercel.com/
2. 点击 Add New Project
3. 选择你的 GitHub 仓库
4. Framework 选择 Vite
5. 点击 Deploy

### 方法二：GitHub Pages

1. 新建 GitHub 仓库，比如：`tsla-0dte-dashboard`
2. 把这些文件上传到仓库
3. 在 GitHub 仓库页面进入：Settings → Pages
4. Source 选择 GitHub Actions
5. 新建 `.github/workflows/deploy.yml`
6. 填入下面内容：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install
        run: npm install
      - name: Build
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

7. 上传后，GitHub 会自动部署。

---

## 后续升级方向

- 接入真实 TSLA 行情
- 接入期权链和 IV Rank
- 接入 Options Flow API
- 加入新闻事件风险过滤
- 加入账户资金和连续亏损风控
- 加入历史回测模块
