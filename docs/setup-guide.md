# 配置教程：内网测试版、正式版、App

Lucky 分两套环境，都**不需要 Cloudflare 隧道或任何内网穿透**：

| | 内网测试版 | 正式版 |
| --- | --- | --- |
| 跑在哪里 | 威联通 NAS | 云服务器（推荐新加坡机房） |
| 谁能访问 | 只有同一局域网（Wi-Fi）里的设备 | 所有人 |
| 网址 | `http://NAS的IP:3000` | `https://你的域名` |
| 登录方式 | 测试账号（邮箱 + 密码） | LINE、Google |
| 搜索引擎 | 禁止收录 | 允许收录 |
| 更新方式 | 合并到 `main` 后自动更新 | 你手动决定何时上线 |
| 镜像标签 | `:staging` | `:prod` 和版本号（如 `v1.0.0`） |
| App | “Lucky 测试”，连 NAS | “Lucky”，连正式网站 |

为什么内网版不能用 LINE/Google 登录：这两家要求回调地址是公网可访问的 https 域名（本机 `localhost` 除外），局域网 IP 不被接受。所以内网版改用测试账号，正式版会强制关闭测试账号（即使误开也不生效，CI 每次都会检查）。

全文用 `192.168.1.100` 代表 NAS 的 IP，`example.com` 代表正式域名，请替换成你自己的。

---

## 准备：GitHub 拉镜像的令牌

两套环境都从 GitHub 镜像仓库拉镜像，仓库是私有的，需要一个只读令牌：

1. GitHub 右上角头像 → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)** → **Generate new token (classic)**
2. Note：`lucky-pull`；Expiration 按需要选（例如 1 年）；只勾选 **read:packages**
3. 生成后复制保存，只显示一次。NAS 和服务器都可以用这一个

---

# 第一部分：内网测试版（威联通 NAS）

## 1.1 固定 NAS 的 IP

在路由器后台的 DHCP 设置里，把 NAS 绑定到固定 IP，例如 `192.168.1.100`。网址在构建镜像时写进去，IP 变了就要重新构建。

## 1.2 GitHub 设置内网网址并构建镜像

1. 仓库 `oct17b-stack/lucky` → **Settings** → **Secrets and variables** → **Actions** → **Variables** → **New repository variable**
   - Name：`LAN_URL`
   - Value：`http://192.168.1.100:3000`（不要以 `/` 结尾）
   - 以前设过 `STAGING_URL` 的可以删掉
2. **Actions** → 左侧 **构建测试版镜像** → **Run workflow**，等绿色对勾（约 3 分钟）

## 1.3 NAS 准备

1. **App Center** 安装 **Container Station**（3.x）
2. **控制台** → **网络和文件服务** → **Telnet/SSH** → 勾选“允许 SSH 连接”
3. 电脑终端：`ssh admin@192.168.1.100`

## 1.4 放置文件并填写 .env

```bash
mkdir -p /share/Container/lucky-staging
cd /share/Container/lucky-staging
```

用 File Station 把仓库 `deploy/qnap/` 里的 `docker-compose.yml` 和 `.env.example` 上传到这个文件夹，然后：

```bash
cp .env.example .env
vi .env
```

| 变量 | 填什么 |
| --- | --- |
| `POSTGRES_PASSWORD` | 执行 `openssl rand -hex 24` 生成 |
| `NEXT_PUBLIC_SITE_URL` | `http://192.168.1.100:3000`，与 `LAN_URL` 相同 |
| `BETTER_AUTH_SECRET` | 执行 `openssl rand -base64 32` 生成 |
| 其他 | 保持默认 |

内网版**不用填** Google、LINE 密钥。

> 以前按旧教程部署过（带 Cloudflare 隧道）的：用新的 `docker-compose.yml` 覆盖旧文件，`.env` 里删掉 `CLOUDFLARE_TUNNEL_TOKEN` 和 Google/LINE 密钥，把 `NEXT_PUBLIC_SITE_URL` 改成内网地址，然后执行 `docker compose up -d --remove-orphans`，旧的 cloudflared 容器会被删掉。Cloudflare 后台的隧道和 Access 应用也可以删掉。

## 1.5 登录镜像仓库并启动

威联通 admin 的家目录重启后会清空，所以登录凭据存在持久文件夹里：

```bash
cd /share/Container/lucky-staging
export DOCKER_CONFIG=/share/Container/lucky-staging/.docker
docker login ghcr.io -u <你的 GitHub 用户名>     # Password 填准备阶段的令牌
docker compose pull
docker compose up -d
docker compose ps
```

四个容器（web、postgres、backup、watchtower）都应该是 running。

## 1.6 验证

| 检查项 | 方法 | 预期 |
| --- | --- | --- |
| 网站运行 | 同一 Wi-Fi 下浏览器打开 `http://192.168.1.100:3000/api/health` | `{"ok":true,"env":"lan",...}` |
| 首页 | 打开 `http://192.168.1.100:3000` | 泰文首页，顶部有测试版提示 |
| 测试账号 | 右上角“เข้าสู่ระบบ” → “ยังไม่มีบัญชีทดสอบ? สมัครที่นี่” → 填邮箱和密码 | 注册后进入“บัญชีของฉัน” |
| 自动更新 | 合并代码到 `main` 后等 10–15 分钟 | 网站自动变成新版本 |

测试账号的邮箱不需要真实存在（例如 `test1@example.com`），不会发验证邮件。注意要用 IP 地址访问，用 `nas.local` 之类的名字访问时，登录会因为地址不一致而失败。

---

# 第二部分：正式版（云服务器）

## 2.1 买服务器、配域名

1. 云服务器：2 核 4 GB 起，系统 **Ubuntu 24.04**，机房选 **新加坡**（泰国访问延迟低）。阿里云国际、腾讯云国际、AWS Lightsail、DigitalOcean、Vultr 都可以
2. 安全组/防火墙只放行 **22、80、443** 端口
3. 域名 DNS 添加两条 A 记录，都指向服务器公网 IP：
   - `@` → 服务器 IP
   - `www` → 服务器 IP
   - 域名托管在 Cloudflare 的话，先把这两条记录的“代理状态”设成**仅 DNS**（灰色云朵），等证书申请成功后再考虑开启

## 2.2 GitHub 设置正式网址并构建镜像

1. **Settings** → **Secrets and variables** → **Actions** → **Variables** → 新建 `PROD_URL` = `https://example.com`
2. 构建正式版镜像，两种方式任选：
   - **Actions** → **构建正式版镜像** → **Run workflow**（产出 `:prod`）
   - 推送版本标签：`git tag v1.0.0 && git push origin v1.0.0`（产出 `:prod` 和 `:v1.0.0`，方便回滚）

## 2.3 申请 LINE 登录

1. 打开 [LINE Developers Console](https://developers.line.biz/console/)，用 LINE 账号登录
2. **Create a new provider**：填品牌名，例如 `Lucky`
3. 在这个 Provider 里 **Create a new channel** → 选 **LINE Login**
   - Region to provide the service：**Thailand**
   - Channel name：用户在授权页看到的名字，例如 `Lucky ดูดวง`
   - App types：勾选 **Web app**
   - 填联系邮箱，同意条款后创建
4. 渠道 → **LINE Login** 标签页 → **Callback URL**：
   ```
   https://example.com/api/auth/callback/line
   ```
5. **Basic settings** 标签页：复制 **Channel ID** → `LINE_CLIENT_ID`，**Channel secret** → `LINE_CLIENT_SECRET`
6. **申请邮箱权限**（建议）：同一页 **OpenID Connect** → **Email address permission** → **Apply**，上传一张网站说明“会获取邮箱及用途”的截图（隐私政策页或登录页下方的说明）。不申请也能登录，但同一个人先后用 Google 和 LINE 登录会被当成两个账号
7. 渠道默认是 **Developing**，只有你自己和 **Roles** 里的测试人员能登录。正式开放前切换为 **Published**

## 2.4 申请 Google 登录

1. 打开 [Google Cloud Console](https://console.cloud.google.com/) → 新建项目 `lucky`（不需要开通结算）
2. 搜索 **Google Auth Platform** → **开始**：应用名称 `Lucky`，支持邮箱选你自己，受众选 **外部**，填联系邮箱，创建
3. **品牌塑造**：“已获授权的网域”添加 `example.com`，填首页和隐私政策链接
4. **受众**：测试阶段添加测试用的 Google 账号
5. **客户端** → **创建客户端** → 应用类型 **Web 应用**，名称 `lucky-web`，已获授权的重定向 URI：
   ```
   https://example.com/api/auth/callback/google
   ```
6. 复制 **客户端 ID** → `GOOGLE_CLIENT_ID`，**客户端密钥** → `GOOGLE_CLIENT_SECRET`。密钥只完整显示一次，可以“下载 JSON”保存
7. 正式开放前：**受众** → **发布应用**。只用 openid、email、profile 基本权限，不需要 Google 审核

## 2.5 服务器部署

```bash
ssh root@服务器IP
curl -fsSL https://get.docker.com | sh          # 安装 Docker
mkdir -p /opt/lucky && cd /opt/lucky
```

把仓库 `deploy/production/` 里的 `docker-compose.yml`、`Caddyfile`、`.env.example` 传到 `/opt/lucky`（例如在电脑上用 `scp deploy/production/* deploy/production/.env.example root@服务器IP:/opt/lucky/`），然后：

```bash
cp .env.example .env
nano .env
```

| 变量 | 填什么 |
| --- | --- |
| `SITE_DOMAIN` | `example.com`（不带 https 和 www） |
| `LUCKY_TAG` | `prod`，回滚时改成版本号 |
| `POSTGRES_PASSWORD` | `openssl rand -hex 24` 生成 |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 32` 生成，**不要和内网版相同，上线后不要再改**（改了所有人会被登出） |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | 第 2.4 步 |
| `LINE_CLIENT_ID` / `LINE_CLIENT_SECRET` | 第 2.3 步 |

启动：

```bash
docker login ghcr.io -u <你的 GitHub 用户名>     # Password 填准备阶段的令牌
docker compose pull
docker compose up -d
docker compose logs -f caddy                     # 看到 certificate obtained successfully 即证书申请成功，Ctrl+C 退出
```

## 2.6 验证

| 检查项 | 方法 | 预期 |
| --- | --- | --- |
| HTTPS | 打开 `https://example.com` | 有小锁，泰文首页，没有测试版提示 |
| 健康检查 | `https://example.com/api/health` | `{"ok":true,"env":"production",...}` |
| www 跳转 | `https://www.example.com` | 跳到 `https://example.com` |
| 允许收录 | `https://example.com/robots.txt` | 允许抓取，带 Sitemap |
| LINE 登录 | 登录页 → LINE | 跳到 LINE 授权页，同意后回到“บัญชีของฉัน” |
| Google 登录 | 登录页 → Google | 测试用户账号能登录 |
| 没有测试账号 | 登录页 | 只有 LINE 和 Google 两个按钮 |

最后到 [Google Search Console](https://search.google.com/search-console) 添加网站并提交 `https://example.com/sitemap.xml`。

## 2.7 更新和回滚

正式版不会自动更新，先在内网版测好，再上线：

```bash
# 1. 电脑上打标签，GitHub 自动构建
git tag v1.0.1 && git push origin v1.0.1
# 2. 构建完成后，服务器上
cd /opt/lucky && docker compose pull && docker compose up -d
```

出问题回滚：把 `.env` 的 `LUCKY_TAG` 改成上一个版本号（例如 `v1.0.0`），再执行 `docker compose pull && docker compose up -d`。

数据库每晚自动导出到 `/opt/lucky/data/backups`，保留 30 天。建议另外定期下载到 NAS 或电脑。

---

# 第三部分：App（苹果和安卓）

App 分两个版本，可以同时装在一部手机上：

| | 内网测试版 | 正式版 |
| --- | --- | --- |
| 名字 | Lucky 测试 | Lucky |
| 连接 | `http://192.168.1.100:3000` | `https://example.com` |
| 安装方式 | 安卓直接装 APK；苹果装到已登记的测试设备 | App Store / Google Play |
| 构建命令 | `eas build --profile lan` | `eas build --profile production` |

内网测试版 App 只在手机连着同一个 Wi-Fi 时能连上服务器。它允许局域网 http；正式版只允许 https。

## 3.1 一次性准备

1. 注册 [Expo](https://expo.dev) 账号（免费）
2. 电脑安装 Node.js 20+ 和 pnpm，然后 `npm install -g eas-cli`，`eas login`
3. 在 `apps/mobile` 目录执行 `eas init`，把项目关联到你的 Expo 账号
4. 打开 `apps/mobile/eas.json`，把 `192.168.1.100` 换成 NAS 的 IP，`example.com` 换成正式域名
5. 打开 `apps/mobile/app.config.ts`，把 `com.example.lucky` 换成你自己的包名（例如 `com.你的品牌.lucky`）。**上架后不能再改**
6. 正式上架需要：苹果开发者账号（每年 99 美元）、Google Play 开发者账号（一次性 25 美元）

## 3.2 构建内网测试版

```bash
cd apps/mobile
eas build --profile lan --platform android     # 产出 APK，下载链接发到手机直接安装
eas build --profile lan --platform ios         # 需要先 eas device:create 登记测试 iPhone
```

iPhone 第一次打开时会询问“允许查找本地网络上的设备”，要选**允许**，否则连不上 NAS。

## 3.3 构建并上架正式版

```bash
eas build --profile production --platform all
eas submit --profile production --platform ios       # 提交到 App Store Connect
eas submit --profile production --platform android   # 提交到 Google Play
```

App 内的 LINE/Google 登录和订阅支付会在后续版本加入，复用正式网站的同一套账号。

---

## 常见问题

| 现象 | 原因和解决 |
| --- | --- |
| 内网打不开网站 | 电脑/手机要连同一个局域网；`docker compose ps` 看 web 是否 running |
| 内网版页面里的链接是 `localhost` 或旧 IP | `LAN_URL` 没设或 IP 变了：改好后重新运行“构建测试版镜像” |
| 内网版测试账号登录后又回到登录页 | 访问地址和 `NEXT_PUBLIC_SITE_URL` 不一致（例如用了主机名），改用 IP 访问 |
| 测试账号注册失败 | 密码少于 8 位，或这个邮箱已经注册过 |
| `docker compose pull` 报 `unauthorized` | NAS 上没先 `export DOCKER_CONFIG=...` 再登录；或令牌没有 `read:packages` 权限 |
| 重启 NAS 后不自动更新 | 检查 `/share/Container/lucky-staging/.docker/config.json` 是否存在，不存在就重新登录 |
| 正式版证书申请失败 | DNS 还没生效（`ping example.com` 看是否是服务器 IP）；80/443 端口没放行；Cloudflare 代理没关 |
| “构建正式版镜像”报错要求 `PROD_URL` | 按 2.2 添加仓库变量 |
| Google 报 `redirect_uri_mismatch` | 重定向 URI 要和 `https://example.com/api/auth/callback/google` 逐字一致，没有末尾 `/` |
| LINE 报 `Invalid redirect_uri` | LINE Login 标签页的 Callback URL 没填对 |
| 只有自己能用 LINE 登录 | 渠道还是 Developing：在 Roles 加测试人员，或切换为 Published |
| Google 显示无法登录 | 账号没加到“受众 → 测试用户”，或应用还没发布 |
| 内网版 App 显示 offline | 手机没连同一个 Wi-Fi；iPhone 没允许“本地网络”；`eas.json` 里的 IP 不对 |

## 安全要点

- NAS：不要在路由器上转发 3000 端口；关闭 UPnP、myQNAPcloud 远程访问；不要把 QTS 管理后台暴露到公网
- 服务器：只开放 22、80、443；建议改用 SSH 密钥登录并禁用密码登录
- `.env`、Google/LINE 密钥、GitHub 令牌不要提交到仓库，也不要发在聊天里
- 内网版和正式版用不同的 `BETTER_AUTH_SECRET` 和数据库密码
- 内网版只用假数据
