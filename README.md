# 行程管家（网页版 · 个人自用待办 + 黄历）

一个类似备忘录的待办/行程网页应用（PWA）：勾选完成划线、日/周/月/年四视图、当日黄历宜忌、新增待办可导出到手机系统日历提醒。手机和电脑打开同一个网址，读写同一份数据，不用装原生 APP。

技术栈：React + Vite + TypeScript + Tailwind CSS + **GitHub 私有仓库（数据存储）+ Cloudflare Worker（登录鉴权 + 数据读写中转）** + [lunar-javascript](https://github.com/6tail/lunar-javascript)（本地黄历算法）。

完整技术方案见 `/home/daiq5/.claude/plans/compiled-sparking-petal.md`（**注意**：这份方案文档写的是最初选型腾讯云开发 CloudBase 的设计，后来数据库/鉴权部分依次换成过 Supabase、现在是 GitHub+Cloudflare Worker，文档里这部分已经不是最新的，其余部分仍然适用，最新架构以这份 README 为准）。

## 目前进度

- [x] 阶段0：项目脚手架（Vite + React + TS + Tailwind + PWA插件 + 各依赖库）
- [x] 阶段1：静态外壳 —— 底部导航切换日/周/月/年四个视图，➕新增待办弹窗（标题/备注/日期/时间/提醒档位）
- [x] 额外功能：底部导航第5个标签"全部"——汇总展示所有待办+所属日期，支持勾选完成、按未完成/已完成筛选、点文字区域编辑、按标签筛选（`src/views/AllTasksView.tsx`）
- [x] 额外功能：待办支持"不设置具体日期"（无日期待办只在"全部"里可见，日/周/月/年视图不会显示）+ 单个自由文本标签（会记住历史标签，新增/编辑时可直接选）
- [x] 阶段2：接入 lunar-javascript，黄历卡片换成真实数据（农历日期、宜/忌、节气、传统节日）
- [x] 阶段3：数据真正保存下来了、多端同步。**最初接的是 Supabase，2026-10-10 因为国内网络访问境外 Supabase 服务器偶尔完全连不上（真实抓到过 "Failed to fetch" 的报错），换成了 GitHub 私有仓库存数据 + Cloudflare Worker 做中转**，详见下面"数据后端架构"一节
- [x] 阶段4：PIN 密码保护（`src/auth/PinGate.tsx`，PIN 存在 Cloudflare Worker 的环境密钥里，不在代码里也不在数据仓库里）
- [x] 阶段5：新增待办导出到手机系统日历——`src/lib/ics.ts` 生成 `.ics`，待办列表里日期+时间都填了的条目右边会出现一个小日历图标，点了优先调手机系统分享面板一步加到日历，不支持分享的浏览器会退化成下载 `.ics` 文件
- [x] 阶段6：PWA 化 + 正式部署上线，线上地址：**https://demonqimo-arch.github.io/**（GitHub Pages + GitHub Actions 自动构建部署，每次 `git push` 到 `main` 分支会自动重新构建上线，工作流见 `.github/workflows/deploy.yml`）

## 本地运行（在这台 WSL 环境里）

```bash
cd /home/daiq5/project/02-xingcheng-web
npm install   # 第一次运行前执行一次即可
npm run dev
```

打开浏览器访问 `http://localhost:5173` 即可看到效果（在 Windows 上直接用浏览器打开这个网址，WSL2 会自动把端口转发到 Windows，不需要额外配置）。

现在可以体验：切换日/周/月/年、点击右下角 ➕ 新增一条待办、点击待办前面的圆圈勾选完成（文字会出现删除线）。数据存在一个私有的 GitHub 仓库里，刷新页面、换个浏览器/设备都不会丢。

本地开发不需要配置任何 `.env` 文件了（Worker 地址直接写死在 `src/lib/workerApi.ts` 里，因为这不是敏感信息）。

## 线上部署

正式地址：**https://demonqimo-arch.github.io/**，托管在 GitHub Pages，用 GitHub Actions 自动构建部署（`.github/workflows/deploy.yml`）。

- 每次把代码 `git push` 到 `main` 分支，GitHub 会自动重新 `npm run build` 并发布，几分钟后线上就是最新版本，不需要手动操作
- 构建时用到的 `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` 存在仓库的 **Settings → Secrets and variables → Actions** 里，跟本地的 `.env.local` 是分开配置的两份（改了本地记得同步一下仓库里的，虽然这两个值目前应该不会变）
- 仓库地址：`github.com/demonqimo-arch/demonqimo-arch.github.io`，用的是 GitHub 的"用户站点"特殊仓库名，所以网址是根域名不带路径

### 数据后端架构（GitHub + Cloudflare Worker）

**为什么不用数据库服务了**：最初用的是 Supabase（海外免费数据库），但国内网络访问经常不稳定，实测抓到过浏览器 "Failed to fetch" 这种彻底连不上的情况（不是慢，是根本连不通）。咱们自己的监控数据显示 GitHub（托管网页）这条线路一直很稳定，所以 2026-10-10 把数据这部分也换成了 GitHub，复用这条相对可靠的线路。

**架构**：
- 待办数据存成一个 JSON 文件，放在一个**私有**仓库 `demonqimo-arch/xingcheng-data` 里（私有是因为如果用公开仓库，任何人都能直接在 GitHub 网页上看到数据内容，绕过PIN保护）
- 网页本身不直接连 GitHub API（也不知道怎么证明自己有权限操作这个私有仓库），中间架了一个 **Cloudflare Worker**（`worker/` 目录，免费、不用绑卡）当中转：
  - `POST /login`：网页把PIN发过来，Worker 跟自己环境变量里存的真实PIN比对，对了就签发一个有效期180天的登录凭证（简单的 HMAC 签名token，不是真数据库session，但够用）
  - `GET /tasks`：带着凭证来请求，验证通过后 Worker 用它自己持有的 GitHub 令牌去读取 `xingcheng-data` 仓库里的 `tasks.json`，返回给网页
  - `PUT /tasks`：同样验证凭证后，把网页传来的最新待办列表整个写回 `tasks.json`（GitHub 的文件API要求带上原来文件的 `sha` 做乐观并发控制，防止多端同时改产生冲突）
- Worker 的环境密钥（`APP_PIN`、`SESSION_SECRET`、`GITHUB_TOKEN`）都配置在 Cloudflare 后台，不出现在任何代码仓库里；`GITHUB_TOKEN` 是一个细粒度 PAT，权限严格限定在 `xingcheng-data` 这一个仓库，即使泄露影响范围也很小
- Worker 部署：`cd worker && npx wrangler deploy`（需要 `CLOUDFLARE_API_TOKEN`/`CLOUDFLARE_ACCOUNT_ID` 环境变量），线上地址 `https://xingcheng-worker.3156400437.workers.dev`
- Supabase 项目先保留不删（万一以后想切回去），但网页已经完全不依赖它了

### 健康检查

`.github/workflows/healthcheck.yml` 每小时自动跑一次（实际因为 GitHub 对低活跃仓库的定时任务降频，真实间隔通常是3-9小时），检测网站（GitHub Pages）和 Cloudflare Worker 是否正常响应，结果写进 `.github/healthcheck/log.txt` 并提交。**如果检测失败，自动在仓库 Issues 里开一条记录**（同一次故障期间只开一条，后续失败追加评论，不刷屏），写清楚状态码和耗时，不需要去翻 Actions 运行日志。

**唯一要注意的点**：如果以后这个项目改动很少、连续60天都没有正常的功能开发提交，理论上还是要靠这个任务自己的提交撑着仓库的"活跃度"（否则 GitHub 会自动停用仓库里所有定时任务）——目前看这个机制本身是自洽的（它自己一直在提交），不需要额外操心。如果哪天发现网页又长时间打不开，先去 Issues 里看有没有自动生成的失败记录，或者去 Actions 页面看这个工作流最近有没有正常跑；也可以在 PIN 登录界面点"查看本地诊断日志"，看手机本地记录的真实报错（这个不依赖任何远程服务，网络再差也能记下来）。

## 目录结构

- `src/types/task.ts` — 待办数据结构定义
- `src/store/TaskStore.tsx` — 用 TanStack Query 对接 Cloudflare Worker 的真实数据读写（增删改查 + 标签统计），`src/lib/workerApi.ts` 是具体的请求封装
- `worker/` — Cloudflare Worker 源码，登录鉴权 + GitHub 数据仓库读写中转
- `src/hooks/` — `useTasksInRange`/`useTasksOnDate`（按日期范围取待办）、`useSelectedDate`（当前选中日期，存在网址参数里）
- `src/views/` — 日/周/月/年四个视图
- `src/components/` — 黄历卡片、待办列表项、新增待办弹窗、底部导航等可复用组件
- `src/data/holidays/` + `src/lib/holidays.ts` — 法定节假日/调休数据（月视图上的"休/班"标记）

## 节假日数据需要每年更新一次

月视图上显示的法定节假日名称和"调休上班"标记，数据来自社区维护的 [holiday-cn](https://github.com/NateScarlet/holiday-cn) 项目（整理自国务院公告），本地存了 `src/data/holidays/2025.json`、`2026.json`、`2027.json` 三份，不需要联网即可使用。

国务院一般在每年 11-12 月才会公布下一年的节假日安排，所以 `2027.json` 目前是空的（公布之前拿不到数据，属于正常情况）。等新一年的安排公布后（一般在上一年11月前后），找我说一句"更新一下节假日数据"，我会重新拉取最新的 JSON 文件替换掉。

## 《非人哉》角色素材

`src/assets/feirenzai/` 里放的是你提供的图片（个人自用装饰，不对外分发）：

- `app-icon.png`（连同 `public/icons/app-icon-192.png`/`app-icon-512.png`）— 手机主屏幕图标 + 浏览器标签图标，来自 `hezhao.png` 里裁出的圆脸角色
- `task-done.png` — 待办勾选完成后圆圈里显示的头像，用的 `doudou.png`
- `empty-state.png` — 当天没有待办时的插画，用的 `houge.png`
- `all-done.png` — 当天待办全部完成时的庆祝插画，用的 `caishenbaoyou.png`

## App 背景图（蜡笔小新）

`src/components/MonthlyBackdrop.tsx`（组件名是历史遗留，实际已经不是"每月"了）铺在最底层的固定背景，很淡的透明度，不影响卡片内容阅读，按屏幕宽度响应式切换：

- 手机宽度（`<768px`）：`src/assets/backdrop/mobile.webp`
- 电脑宽度（`≥768px`）：`src/assets/backdrop/desktop.jpg`

两张都是蜡笔小新题材，用户自己下载提供、个人使用不分发。原图备份在项目根目录 `picture_frz/`（`diannao-xiaoxin.jpg`/`shouji-xiaoxin.webp`）。

**历史记录**：这之前是"每月自动换一张彼得兔/爱丽丝梦游仙境公共领域插图"的轮换机制，2026-09-17 应用户要求彻底替换成固定的蜡笔小新背景，不再按月轮换。

原图放在项目根目录 `picture_frz/` 里备份，`hezhao2.png` 暂时没用上，留着以后想加新的小图标时可以再裁。
