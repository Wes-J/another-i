# Another I

一款关于自我理解与生活记录的 Expo + React Native + TypeScript 原型，支持 Android、iOS 和 Web。

## 当前原型

- 个人分析：个人画像、人格偏好、个人信息和价值观。
- 感悟：记录人生经历、阅读笔记与个人观察。
- 生活建模：习惯打卡、生活观察和个人计划。
- AI 创作：从画像与个人记录生成电子名片、自我介绍、感悟卡和短视频脚本示例。
- 数据使用 AsyncStorage 保存在设备或浏览器本地。生成器是本地演示逻辑，暂未连接云端 AI、账号系统或跨设备同步。

## 启动

```bash
npm install
npx expo start
```

按 `w` 在浏览器预览，或用 Expo Go 扫描二维码。iOS 本地构建需要 macOS/Xcode；也可以用 EAS 云构建。

## GitHub Pages

仓库推送到 `master` 后会由 GitHub Actions 构建静态网页并部署至 GitHub Pages。启用时请在仓库 **Settings → Pages → Build and deployment** 将 Source 设为 **GitHub Actions**。项目站点使用 `/another-i` 子路径。

发布后预期地址为 `https://wes-j.github.io/another-i/`（需要将本目录作为 `another-i` 仓库发布，并在仓库设置中启用 Pages）。

## 检查

```bash
npx expo lint
npx tsc --noEmit
npm run build:web
```
