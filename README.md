# 行程管家（网页版 · 个人自用待办 + 黄历）

一个类似备忘录的待办/行程网页应用（PWA）：勾选完成划线、日/周/月/年四视图、当日黄历宜忌、新增待办可导出到手机系统日历提醒。手机和电脑打开同一个网址，读写同一份数据，不用装原生 APP。

技术栈：React + Vite + TypeScript + Tailwind CSS + [Supabase](https://supabase.com)（数据库/鉴权）+ [lunar-javascript](https://github.com/6tail/lunar-javascript)（本地黄历算法）。

完整技术方案见 `/home/daiq5/.claude/plans/compiled-sparking-petal.md`（**注意**：该文档里写的是最初选型腾讯云开发 CloudBase，后来发现免费环境"开发免费、正式使用需付费"不符合个人长期使用的诉求，已经改用 Supabase，方案文档里数据库/鉴权那部分已经不是最新的，其余部分仍然适用）。

## 目前进度

- [x] 阶段0：项目脚手架（Vite + React + TS + Tailwind + PWA插件 + 各依赖库）
- [x] 阶段1：静态外壳 —— 底部导航切换日/周/月/年四个视图，➕新增待办弹窗（标题/备注/日期/时间/提醒档位）
- [x] 额外功能：底部导航第5个标签"全部"——汇总展示所有待办+所属日期，支持勾选完成、按未完成/已完成筛选、点文字区域编辑、按标签筛选（`src/views/AllTasksView.tsx`）
- [x] 额外功能：待办支持"不设置具体日期"（无日期待办只在"全部"里可见，日/周/月/年视图不会显示）+ 单个自由文本标签（会记住历史标签，新增/编辑时可直接选）
- [x] 阶段2：接入 lunar-javascript，黄历卡片换成真实数据（农历日期、宜/忌、节气、传统节日）
- [x] 阶段3：接入 Supabase 数据库，数据真正保存下来了、多端同步（`src/lib/supabase.ts` + `src/lib/tasksApi.ts` + `src/store/TaskStore.tsx`）。莫少爷备忘录里的12条真实待办已经正式导入到 Supabase 的 `tasks` 表里，不再是临时假数据
- [x] 阶段4：PIN 密码保护（`src/auth/PinGate.tsx`，PIN 就是 Supabase 里固定账号 `owner@xingcheng.app` 的密码，`tasks` 表 RLS 规则已收紧为"必须登录才能读写"）
- [x] 阶段5：新增待办导出到手机系统日历——`src/lib/ics.ts` 生成 `.ics`，待办列表里日期+时间都填了的条目右边会出现一个小日历图标，点了优先调手机系统分享面板一步加到日历，不支持分享的浏览器会退化成下载 `.ics` 文件
- [x] 阶段6：PWA 化 + 正式部署上线，线上地址：**https://demonqimo-arch.github.io/**（GitHub Pages + GitHub Actions 自动构建部署，每次 `git push` 到 `main` 分支会自动重新构建上线，工作流见 `.github/workflows/deploy.yml`）

## 本地运行（在这台 WSL 环境里）

```bash
cd /home/daiq5/project/02-xingcheng-web
npm install   # 第一次运行前执行一次即可
npm run dev
```

打开浏览器访问 `http://localhost:5173` 即可看到效果（在 Windows 上直接用浏览器打开这个网址，WSL2 会自动把端口转发到 Windows，不需要额外配置）。

现在可以体验：切换日/周/月/年、点击右下角 ➕ 新增一条待办、点击待办前面的圆圈勾选完成（文字会出现删除线）。数据存在 Supabase 数据库里，刷新页面、换个浏览器/设备都不会丢。

**运行前需要有 `.env.local` 文件**（项目根目录，内容是 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 两行，问我要具体值）。这个文件不进 git（`.gitignore` 里的 `*.local` 规则已经排除掉了）。

## 线上部署

正式地址：**https://demonqimo-arch.github.io/**，托管在 GitHub Pages，用 GitHub Actions 自动构建部署（`.github/workflows/deploy.yml`）。

- 每次把代码 `git push` 到 `main` 分支，GitHub 会自动重新 `npm run build` 并发布，几分钟后线上就是最新版本，不需要手动操作
- 构建时用到的 `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` 存在仓库的 **Settings → Secrets and variables → Actions** 里，跟本地的 `.env.local` 是分开配置的两份（改了本地记得同步一下仓库里的，虽然这两个值目前应该不会变）
- 仓库地址：`github.com/demonqimo-arch/demonqimo-arch.github.io`，用的是 GitHub 的"用户站点"特殊仓库名，所以网址是根域名不带路径

## 目录结构

- `src/types/task.ts` — 待办数据结构定义
- `src/store/TaskStore.tsx` — 阶段1临时用的本地假数据存储（阶段3会替换成真实的 Supabase 数据读写，替换后其余组件基本不用改）
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
