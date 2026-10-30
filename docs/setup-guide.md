# 配置教程：测试版上线、Google 与 LINE 登录

本文按顺序完成以下几件事，大约需要 1–2 小时：

1. 准备域名，决定测试版网址
2. 在 GitHub 设置测试版网址，重新构建镜像
3. 申请 LINE 登录
4. 申请 Google 登录
5. 在 Cloudflare 建隧道和访问控制
6. 在威联通 NAS 上部署
7. 验证

全文用 `beta.example.com` 代表测试版网址，请替换成你自己的域名。

---

## 第 1 步：准备域名

- 需要一个托管在 Cloudflare 的域名：在 Cloudflare 添加站点，把域名注册商的 DNS 服务器改成 Cloudflare 给的两个地址。
- 定好测试版网址，例如 `beta.example.com`。下面所有的回调地址都以它为准。

## 第 2 步：GitHub 设置测试版网址并重新构建镜像

网站地址是在镜像构建时写进去的，**必须先设置，再构建**。

1. 打开仓库 `oct17b-stack/lucky` → **Settings** → **Secrets and variables** → **Actions** → **Variables** 标签页 → **New repository variable**
   - Name：`STAGING_URL`
   - Value：`https://beta.example.com`（不要以 `/` 结尾）
2. 打开 **Actions** → 左侧选 **构建测试版镜像** → 右侧 **Run workflow** → **Run workflow**
3. 等它变成绿色的对勾（约 3 分钟）

再生成一个给 NAS 拉镜像用的令牌（仓库是私有的，镜像也是私有的）：

4. GitHub 右上角头像 → **Settings** → **Developer settings** → **Personal access tokens** → **Tokens (classic)** → **Generate new token (classic)**
   - Note：`qnap-pull`
   - Expiration：按需要选，例如 1 年
   - 只勾选 **read:packages**
   - 生成后复制保存，这个令牌只显示一次

## 第 3 步：LINE 登录（泰国用户优先）

1. 打开 [LINE Developers Console](https://developers.line.biz/console/)，用 LINE 账号登录
2. **Create a new provider**：填品牌名，例如 `Lucky`
3. 在这个 Provider 里 **Create a new channel** → 选 **LINE Login**
   - Region to provide the service：**Thailand**
   - Company or owner's country or region：按实际填写
   - Channel name：用户在授权页看到的名字，例如 `Lucky ดูดวง`
   - Channel description、App types：App types 勾选 **Web app**
   - Email address：你的联系邮箱
   - 勾选同意条款后创建
4. 进入新建的渠道 → **LINE Login** 标签页 → **Callback URL** 点 Edit，每行填一个：
   ```
   https://beta.example.com/api/auth/callback/line
   http://localhost:3000/api/auth/callback/line
   ```
5. **Basic settings** 标签页：
   - 复制 **Channel ID** → 稍后填到 `LINE_CLIENT_ID`
   - 复制 **Channel secret** → 稍后填到 `LINE_CLIENT_SECRET`
6. **申请邮箱权限**（建议做）：同一页 **OpenID Connect** → **Email address permission** → **Apply**
   - 需要上传一张截图，内容是网站告诉用户“会获取邮箱及用途”的页面。可以截隐私政策页，或者登录页下方的说明文字
   - 不申请也能登录。但拿不到邮箱的话，同一个人先后用 Google 和 LINE 登录，会被当成两个账号
7. 渠道默认是 **Developing** 状态，只有你自己（以及在 **Roles** 里添加的测试人员）能登录。正式上线前，点渠道页顶部的 **Developing** 切换为 **Published**

## 第 4 步：Google 登录

1. 打开 [Google Cloud Console](https://console.cloud.google.com/)，顶部项目选择器 → **新建项目**，名称例如 `lucky`，不需要开通结算
2. 搜索框输入 **Google Auth Platform**（或菜单 **API 和服务** → **OAuth 同意屏幕**）→ **开始**
   - 应用信息：应用名称 `Lucky`，用户支持邮箱选你自己
   - 受众：选 **外部（External）**
   - 联系信息：填你的邮箱
   - 同意政策后点 **创建**
3. **品牌塑造（Branding）**：可以上传图标；“已获授权的网域”添加 `example.com`（你的主域名）；填写首页和隐私政策链接
4. **受众（Audience）**：测试阶段点 **添加用户**，把要测试的 Google 账号加进去（应用在“测试”状态时，只有这些账号能登录）
5. **客户端（Clients）** → **创建客户端**
   - 应用类型：**Web 应用**
   - 名称：`lucky-web`
   - 已获授权的 JavaScript 来源：可以不填
   - 已获授权的重定向 URI，每个环境一条，必须完全一致：
     ```
     https://beta.example.com/api/auth/callback/google
     http://localhost:3000/api/auth/callback/google
     ```
   - 点 **创建**
6. 弹窗里复制 **客户端 ID** 和 **客户端密钥**，分别填到 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET`。**密钥只在这里完整显示一次**，可以点“下载 JSON”保存。丢失的话，在客户端详情里新建一个密钥
7. 正式上线前：**受众** → **发布应用**。本网站只用 openid、email、profile 这几个基本权限，不需要 Google 审核

## 第 5 步：Cloudflare 隧道和访问控制

隧道让外网访问 NAS 上的测试版，不需要在路由器上开任何端口。

### 5.1 建隧道

1. Cloudflare 后台左侧进入 **Zero Trust**（新版叫 **Cloudflare One**）。第一次进入要设置团队名，并选择 **Free** 方案
2. **Networking** → **Tunnels** → **Create a tunnel** → 选 **Cloudflared**
3. 名称：`lucky-nas` → **Save tunnel**
4. 选择环境 **Docker**。页面会给出一条 `docker run ... --token eyJ...` 命令，**复制 `--token` 后面那一长串**，填到 `.env` 的 `CLOUDFLARE_TUNNEL_TOKEN`。不用执行这条命令，我们用 docker compose 启动
5. 下一步（或在隧道的 **Routes** 标签页 → **Add route** → **Published application**）：
   - Subdomain：`beta`
   - Domain：选 `example.com`
   - Service Type：**HTTP**
   - URL：`web:3000`
   - 保存

### 5.2 访问控制（只让你和测试人员访问）

1. **Access** → **Applications** → **Add an application** → **Self-hosted**
2. 应用名 `lucky-beta`，域名填 `beta.example.com`
3. 添加策略：Action 选 **Allow**，规则选 **Emails**，填你和测试人员的邮箱
4. 保存。之后访问测试版会先要求输入邮箱验证码，通过后才能看到网站

Access 和网站自己的 LINE/Google 登录互不影响：先过 Cloudflare 的邮箱验证，再在网站里用 LINE 或 Google 登录。

## 第 6 步：威联通 NAS 部署

### 6.1 准备

1. **App Center** 安装 **Container Station**（3.x 版本）
2. **控制台** → **网络和文件服务** → **Telnet/SSH** → 勾选“允许 SSH 连接”
3. 电脑上打开终端：`ssh admin@NAS的IP`
4. 确认架构（Intel 或 ARM 都支持，只是确认一下）：
   ```bash
   uname -m
   ```

### 6.2 放置文件

```bash
mkdir -p /share/Container/lucky-staging
cd /share/Container/lucky-staging
```

把仓库里 `deploy/qnap/` 的 `docker-compose.yml` 和 `.env.example` 拷到这个文件夹（可以用 File Station 上传），然后：

```bash
cp .env.example .env
vi .env    # 或在电脑上编辑好再上传
```

### 6.3 填写 .env

| 变量 | 填什么 | 来源 |
| --- | --- | --- |
| `POSTGRES_USER` | `lucky` | 保持默认 |
| `POSTGRES_PASSWORD` | 随机长密码 | 执行 `openssl rand -hex 24` 生成 |
| `POSTGRES_DB` | `lucky_staging` | 保持默认 |
| `CLOUDFLARE_TUNNEL_TOKEN` | `eyJ...` | 第 5.1 步 |
| `NEXT_PUBLIC_SITE_URL` | `https://beta.example.com` | 与第 2 步的 `STAGING_URL` 相同 |
| `DOCKER_CONFIG_JSON` | `/share/Container/lucky-staging/.docker/config.json` | 见 6.4 |
| `BETTER_AUTH_SECRET` | 随机字符串 | 执行 `openssl rand -base64 32` 生成 |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | | 第 4 步 |
| `LINE_CLIENT_ID` / `LINE_CLIENT_SECRET` | | 第 3 步 |

注意：

- 数据库第一次启动后，`POSTGRES_PASSWORD` 不要再改；要改，得先删掉 `data/postgres` 文件夹，数据会清空
- `.env` 里有密钥，不要上传到 GitHub，也不要发给别人

### 6.4 登录镜像仓库

威联通 admin 的家目录在重启后会被清空，所以把登录凭据存到持久的文件夹里：

```bash
cd /share/Container/lucky-staging
export DOCKER_CONFIG=/share/Container/lucky-staging/.docker
docker login ghcr.io -u <你的 GitHub 用户名>
# Password 填第 2 步生成的 read:packages 令牌
```

### 6.5 启动

```bash
cd /share/Container/lucky-staging
export DOCKER_CONFIG=/share/Container/lucky-staging/.docker
docker compose pull
docker compose up -d
docker compose ps
```

五个容器（web、postgres、backup、cloudflared、watchtower）都应该是 running。启动后可以在 Container Station 里看到它们。

之后代码合并到 `main`，GitHub 会自动构建新镜像，NAS 上的 watchtower 每 10 分钟检查一次，自动更新网站。

## 第 7 步：验证

| 检查项 | 方法 | 预期 |
| --- | --- | --- |
| 网站运行 | 局域网浏览器打开 `http://NAS的IP:3000/api/health` | `{"ok":true,"env":"staging",...}` |
| 外网访问 | 打开 `https://beta.example.com` | 先出现 Cloudflare 邮箱验证，通过后看到泰文首页 |
| 禁止收录 | 打开 `https://beta.example.com/robots.txt` | `Disallow: /` |
| LINE 登录 | 网站右上角“เข้าสู่ระบบ” → LINE | 跳到 LINE 授权页，同意后回到“บัญชีของฉัน” |
| Google 登录 | 同上，选 Google | 用加入测试用户的账号能登录 |
| 账号表 | `docker compose logs web` | 第一次启动时有 `[migrate] 账号表已更新` |

## 常见问题

| 现象 | 原因和解决 |
| --- | --- |
| Google 报 `redirect_uri_mismatch` | 重定向 URI 和实际地址不完全一致：检查 https、子域名、末尾没有 `/` |
| LINE 报 `400 Bad Request` / `Invalid redirect_uri` | LINE Login 标签页的 Callback URL 没填对，要逐字一致 |
| 只有自己能用 LINE 登录 | 渠道还在 Developing：在 Roles 加测试人员，或切换为 Published |
| Google 显示“此应用未经验证”或无法登录 | 账号没加到“受众 → 测试用户”，或应用还没发布 |
| 登录后又回到登录页 | `.env` 的 `NEXT_PUBLIC_SITE_URL` 与实际网址不一致，或没设 `BETTER_AUTH_SECRET` |
| 页面里的链接或分享地址是 `localhost` | 第 2 步的 `STAGING_URL` 没设，或设了之后没有重新构建镜像 |
| `docker compose pull` 报 `unauthorized` | 没执行 `export DOCKER_CONFIG=...` 再登录，或令牌没有 `read:packages` 权限 |
| 外网打不开、本地正常 | `docker compose logs cloudflared` 看隧道是否连上；检查路由的 URL 是 `web:3000`、类型是 HTTP |
| 重启 NAS 后没自动更新 | 检查 `DOCKER_CONFIG_JSON` 指向的 `config.json` 是否存在 |

## 安全要点

- 不要把威联通管理后台暴露到公网：关闭 UPnP、路由器端口转发和 myQNAPcloud 远程访问
- 测试版只用假数据
- 各种密钥（`.env`、Google/LINE 密钥、GitHub 令牌）不要提交到仓库，也不要发在聊天里
- 正式版和测试版要用不同的 `BETTER_AUTH_SECRET`
