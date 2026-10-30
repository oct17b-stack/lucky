# 威联通 NAS 测试版部署

测试版的构建在 GitHub Actions 上完成，NAS 只负责拉取镜像和运行。代码合并到 `main` 后约 10 分钟，NAS 上的测试版会自动更新。

> **完整的分步教程（含 GitHub、LINE、Google、Cloudflare 设置和常见问题）见 [docs/setup-guide.md](../../docs/setup-guide.md)。** 本页只是摘要。

## 一次性准备

1. **确认 CPU 架构**：SSH 登录 NAS 执行 `uname -m`。`x86_64` 或 `aarch64` 都支持，镜像同时打了两种架构。
2. **安装 Container Station**：App Center 中安装（需要 3.x 版本，支持 Docker Compose）。
3. **建目录**：在共享文件夹下新建 `lucky-staging`，例如 `/share/Container/lucky-staging`，把本目录的 `docker-compose.yml` 和 `.env.example` 放进去，并把 `.env.example` 复制为 `.env` 后填写。
4. **登录镜像仓库**（仓库是私有的才需要）：
   - 在 GitHub 生成一个只有 `read:packages` 权限的 Personal Access Token
   - NAS 上先执行 `export DOCKER_CONFIG=/share/Container/lucky-staging/.docker`，再 `docker login ghcr.io -u <GitHub 用户名>`，密码填这个 token
   - `.env` 里的 `DOCKER_CONFIG_JSON` 保持默认的 `/share/Container/lucky-staging/.docker/config.json`
5. **创建 Cloudflare Tunnel**：
   - Cloudflare One（Zero Trust）→ Networking → Tunnels → Create a tunnel，选 Cloudflared，环境选 Docker
   - 复制命令里 `--token` 后面的字符串，填到 `.env` 的 `CLOUDFLARE_TUNNEL_TOKEN`
   - 路由（Published application）：子域名 `beta`，类型 HTTP，URL `web:3000`
6. **加访问控制**：Zero Trust → Access → Applications 新建一个应用，域名填 `beta.你的域名`，策略只允许你和测试用户的邮箱。
7. **登录配置**：在 `.env` 填 `BETTER_AUTH_SECRET` 和 Google / LINE 的密钥，后台的回调地址填 `https://beta.你的域名/api/auth/callback/google`（或 `/line`）。详细步骤见 [docs/login-setup.md](../../docs/login-setup.md)。账号表会在网站启动时自动创建。
8. **设置网址**：GitHub 仓库 Settings → Secrets and variables → Actions → Variables 添加 `STAGING_URL`，然后手动运行一次“构建测试版镜像”。
9. **启动**：在该目录执行 `export DOCKER_CONFIG=/share/Container/lucky-staging/.docker && docker compose pull && docker compose up -d`。

## 检查

- 局域网：`http://NAS的IP:3000/api/health` 返回 `{"ok":true,"env":"staging",...}`
- 外网：`https://beta.你的域名/api/health`（需要先通过 Cloudflare Access 登录）
- 测试版全站带 `X-Robots-Tag: noindex`，`robots.txt` 禁止抓取

## 安全

- **不要**把 QTS 管理后台暴露到公网，关闭 UPnP、路由器端口转发和 myQNAPcloud 远程访问
- 只通过 Cloudflare Tunnel 对外访问测试版
- 测试版只用假数据，Stripe 用测试模式，Apple / Google 用沙盒账号
- 开启存储池快照；`backup` 容器每晚导出数据库到 `data/backups`，保留 14 天

## 常用命令

```bash
docker compose ps                 # 查看状态
docker compose logs -f web        # 看网站日志
docker compose pull && docker compose up -d   # 手动更新
```
