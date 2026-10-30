# 正式版部署（云服务器）

网站和 App 都连这台服务器。Caddy 负责 HTTPS 证书，**不需要 Cloudflare 隧道或任何穿透**。

> 完整的分步教程见 [docs/setup-guide.md](../../docs/setup-guide.md) 第二部分。

## 步骤摘要

1. 买一台云服务器：2 核 4 GB 起，Ubuntu 24.04，推荐新加坡机房
2. 域名 DNS：`@` 和 `www` 的 A 记录指向服务器 IP
3. 服务器安全组/防火墙只开 22、80、443
4. 安装 Docker：`curl -fsSL https://get.docker.com | sh`
5. GitHub 仓库变量 `PROD_URL` = `https://你的域名`，运行“构建正式版镜像”（或打 `v1.0.0` 这样的标签）
6. 服务器上建 `/opt/lucky`，放入本目录的 `docker-compose.yml`、`Caddyfile`、`.env.example`，复制为 `.env` 并填写
7. `docker login ghcr.io`，然后 `docker compose pull && docker compose up -d`

## 更新和回滚

正式版**不自动更新**，由你决定什么时候上线：

```bash
cd /opt/lucky
docker compose pull && docker compose up -d     # 更新到最新 :prod
# 回滚：把 .env 里的 LUCKY_TAG 改成上一个版本号（例如 v1.0.0），再执行上面一行
```

## 检查

- `https://你的域名/api/health` 返回 `{"ok":true,"env":"production",...}`
- 登录页只有 LINE 和 Google，没有测试账号
- `https://你的域名/robots.txt` 允许抓取，并带 sitemap
