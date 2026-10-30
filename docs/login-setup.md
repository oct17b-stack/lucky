# Google 和 LINE 登录配置

> 完整的分步教程（含测试版部署和常见问题）见 [setup-guide.md](setup-guide.md)，本页是登录部分的摘要。

网站使用 Better Auth，回调地址固定为：

| 登录方式 | 回调地址 |
| --- | --- |
| Google | `https://你的域名/api/auth/callback/google` |
| LINE | `https://你的域名/api/auth/callback/line` |

本地开发把域名换成 `http://localhost:3000`，测试版换成 `https://beta.你的域名`。每个环境的地址都要在后台登记，必须完全一致。

只有填了密钥的登录方式才会显示在登录页上，所以可以先只开通其中一种。

## LINE 登录（泰国用户优先）

1. 打开 [LINE Developers Console](https://developers.line.biz/console/)，用 LINE 账号登录
2. 创建 Provider（填公司或品牌名），再在其中创建 **LINE Login** 渠道
   - Region：Thailand
   - App types：勾选 Web app
3. 在渠道的 **LINE Login** 标签页填 Callback URL（可以一行一个，填多个环境）
4. 在 **Basic settings** 标签页复制 Channel ID 和 Channel secret，分别填到 `LINE_CLIENT_ID` 和 `LINE_CLIENT_SECRET`
5. **申请邮箱权限**：Basic settings → OpenID Connect → Email address permission → Apply
   - 需要上传一张截图，说明网站会向用户告知获取邮箱的用途（隐私政策或同意页面）
   - 没有邮箱权限也可以登录，系统会给账号分配一个不可投递的占位地址；但同一个人用 Google 和 LINE 登录时，就无法自动合并成同一个账号
6. 渠道默认是 **Developing** 状态，只有渠道管理员和测试人员能登录。测试完成后点 **Publish** 公开

## Google 登录

1. 打开 [Google Cloud Console](https://console.cloud.google.com/)，新建项目
2. **OAuth 同意屏幕**：用户类型选“外部”，填应用名称、支持邮箱、隐私政策链接；范围保留默认的 email、profile、openid
3. **凭据 → 创建凭据 → OAuth 客户端 ID**，应用类型选 **Web 应用**
   - 已获授权的 JavaScript 来源：`https://你的域名`
   - 已获授权的重定向 URI：上表中的 Google 回调地址
4. 把客户端 ID 和密钥分别填到 `GOOGLE_CLIENT_ID` 和 `GOOGLE_CLIENT_SECRET`
5. 测试阶段把测试账号加到“测试用户”里；正式上线前提交发布

## 其他必填项

- `BETTER_AUTH_SECRET`：随机字符串，用 `openssl rand -base64 32` 生成；正式版和测试版要用不同的值
- `BETTER_AUTH_URL`：网站的完整地址，和回调地址的域名一致
- `DATABASE_URL`：PostgreSQL 连接串；`AUTO_MIGRATE=true` 时，启动时会自动创建账号表

## 测试版注意

测试版前面有 Cloudflare Access。测试用户先通过 Access 的邮箱验证，再用 LINE 或 Google 登录网站，两者互不影响。

## App（后续）

App 将使用 Better Auth 的 Expo 插件，复用同一套账号和回调；LINE 还可以接入 LINE SDK 实现一键登录。
