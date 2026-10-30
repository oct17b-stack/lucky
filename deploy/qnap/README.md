# 威联通 NAS 内网测试版

只在局域网内访问（`http://NAS的IP:3000`），不对外开放，**不需要 Cloudflare 或任何穿透**。

- 登录方式：测试账号（邮箱 + 密码）。Google 和 LINE 要求 https 域名作回调，内网无法使用，留给正式版
- 全站 `noindex`，页面顶部有测试版提示
- 代码合并到 `main` 后，GitHub 自动构建 `:staging` 镜像，NAS 上的 watchtower 约 10 分钟内自动更新

> 完整的分步教程见 [docs/setup-guide.md](../../docs/setup-guide.md) 第一部分。

## 步骤摘要

1. 路由器里给 NAS 固定 IP，例如 `192.168.1.100`
2. GitHub 仓库 → Settings → Secrets and variables → Actions → Variables：添加 `LAN_URL` = `http://192.168.1.100:3000`，然后手动运行一次“构建测试版镜像”
3. NAS 安装 Container Station 3.x，开启 SSH
4. 建目录 `/share/Container/lucky-staging`，放入本目录的 `docker-compose.yml` 和 `.env.example`，复制为 `.env` 并填写
5. 登录镜像仓库：`export DOCKER_CONFIG=/share/Container/lucky-staging/.docker && docker login ghcr.io -u <GitHub 用户名>`（密码是 `read:packages` 令牌）
6. 启动：`docker compose pull && docker compose up -d`

## 检查

- `http://NAS的IP:3000/api/health` 返回 `{"ok":true,"env":"lan",...}`
- 登录页显示“测试账号”表单，可以注册并登录

## 安全

- 不要在路由器上转发 3000 端口，关闭 UPnP 和 myQNAPcloud 远程访问
- 只用假数据测试

## 常用命令

```bash
export DOCKER_CONFIG=/share/Container/lucky-staging/.docker
docker compose ps                 # 查看状态
docker compose logs -f web        # 看网站日志
docker compose pull && docker compose up -d   # 手动更新
```
