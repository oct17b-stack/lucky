# Lucky · 多语言在线命理平台

泰文、简体中文、繁体中文、英文四语命理网站，加 iOS / Android App，三端共用一个账号和订阅。规划文档见 Claude Docs 中的《多语言在线命理平台 · 规划方案》。

> 当前状态：**阶段 0 框架**。计算核心已可用并有测试；网站和 App 是可运行的骨架；登录、支付、规则库在后续阶段接入。

## 目录结构

```
apps/
  web/        Next.js 网站（四语路由、SEO、测试版 noindex、Docker）
  mobile/     Expo App（iOS / Android，离线排盘）
packages/
  core/       计算核心：八字、节气、真太阳时、泰式生日星期、手机号分析（纯 TS，无依赖）
  content/    四语界面文案、语言协商
  api/        三端共享的接口类型
  db/         Prisma schema（PostgreSQL）
deploy/
  qnap/       威联通 NAS 测试版：docker compose、Cloudflare Tunnel、备份
.github/
  workflows/  CI 测试构建；main 分支自动构建 amd64 + arm64 测试版镜像
```

## 本地开发

需要 Node.js 22.18 以上和 pnpm 10。

```bash
corepack enable
pnpm install
pnpm test                 # 运行计算核心与文案测试
pnpm dev:web              # http://localhost:3000 → 自动跳转到 /th 等语言路径
pnpm dev:mobile           # 启动 Expo，用 Expo Go 扫码
```

首次安装 App 依赖后，执行一次 `cd apps/mobile && npx expo install --fix`，把 Expo 相关包对齐到当前 SDK 的版本。安装完成后请提交生成的 `pnpm-lock.yaml`。

App 连接测试版接口：在 `apps/mobile/.env` 写入 `EXPO_PUBLIC_API_URL=https://beta.你的域名`。

## 计算核心说明

| 功能 | 规则 | 状态 |
| --- | --- | --- |
| 年柱 | 以立春精确时刻为界 | 已完成 |
| 月柱 | 以“节”的时刻为界，五虎遁 | 已完成 |
| 日柱 | 真太阳时定日，23:00 换日或早晚子时（可选） | 已完成 |
| 时柱 | 真太阳时定时辰，五鼠遁 | 已完成 |
| 十神、藏干、纳音、五行计数 | 标准表 | 已完成 |
| 大运 | 阳男阴女顺排，三天折一年 | 已完成 |
| 历史时区与夏令时 | IANA 时区库（例如中国 1986–1991 年夏令时） | 已完成 |
| 节气时刻 | 默认 Meeus 低精度太阳模型，误差约 3–8 分钟 | **需替换** |
| 泰式生日星期 | 8 类，周三分昼夜，日出前算前一天（可选） | 规则待顾问审校 |
| 手机号分析 | 号码标准化、总和、8 个数字对 | 含义规则表待顾问提供 |

**阶段 0 验收门槛**：通过 `setSunLongitudeProvider()` 接入 astronomy-engine（MIT）或 Swiss Ephemeris，把 `packages/core/test/astro.test.ts` 的容差从 20 分钟收紧到 1 分钟，并把金标准测试集扩充到 500 例以上。

## 测试版（威联通 NAS）

见 [deploy/qnap/README.md](deploy/qnap/README.md)。需要在 GitHub 仓库的 Settings → Variables 中设置 `STAGING_URL`（例如 `https://beta.example.com`）。

## 下一步（阶段 0 剩余）

- [ ] 接入高精度天文库，节气误差收紧到 1 分钟
- [ ] 扩充金标准测试集（节气交界、子时、闰月、夏令时、南半球）
- [ ] 泰国顾问确认生日星期、幸运色、手机号数字对规则表
- [ ] 导入 GeoNames 城市库
- [ ] NAS 测试版上线
