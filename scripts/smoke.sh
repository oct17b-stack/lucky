#!/usr/bin/env bash
# 冒烟测试：以生产模式启动网站，检查关键页面、自动建表和第三方登录跳转。
# 需要先执行 pnpm --filter web build，并设置 DATABASE_URL 等环境变量（见 .github/workflows/ci.yml）。
set -euo pipefail

BASE=http://localhost:3000
LOG=$(mktemp)
(cd apps/web && pnpm exec next start --port 3000 >"$LOG" 2>&1) &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null || true; echo "--- 服务器日志 ---"; tail -n 40 "$LOG"' EXIT

for i in $(seq 1 60); do
  curl -fsS "$BASE/api/health" >/dev/null 2>&1 && break
  sleep 1
done

fail=0
check() { # 名称 期望状态码 URL [额外 curl 参数...]
  local name=$1 want=$2 url=$3; shift 3
  local got
  got=$(curl -s -o /tmp/smoke-body -w "%{http_code}" "$@" "$url")
  if [ "$got" = "$want" ]; then echo "通过  $name（$got）"; else echo "失败  $name：期望 $want，实际 $got"; head -c 400 /tmp/smoke-body; echo; fail=1; fi
}
contains() { # 名称 文本
  if grep -q "$2" /tmp/smoke-body; then echo "通过  $1"; else echo "失败  $1：页面中没有“$2”"; fail=1; fi
}

check "健康检查" 200 "$BASE/api/health"
check "根路径按泰文浏览器跳转" 307 "$BASE/" -H "Accept-Language: th-TH,th;q=0.9"
check "泰文首页" 200 "$BASE/th"
check "万年历今天" 200 "$BASE/th/calendar"
check "万年历日期页" 200 "$BASE/zh-hans/calendar/2024-02-10"
contains "春节显示为正月初一" "正月初一"
check "无效日期 404" 404 "$BASE/th/calendar/2024-02-30"
check "八字页" 200 "$BASE/en/bazi"
check "生日星期 SEO 页" 200 "$BASE/th/lucky-color/wed-night"
check "站点地图" 200 "$BASE/sitemap.xml"
check "登录页" 200 "$BASE/th/login"
contains "登录页显示 LINE 按钮" "LINE"
check "未登录访问我的页面跳转登录" 307 "$BASE/th/me"
check "未登录会话为空" 200 "$BASE/api/auth/get-session"

# 第三方登录：应返回跳转到 Google / LINE 授权页的地址
for provider in google line; do
  body=$(curl -s -X POST "$BASE/api/auth/sign-in/social" \
    -H "Content-Type: application/json" -H "Origin: $BASE" \
    -d "{\"provider\":\"$provider\",\"callbackURL\":\"/th/me\"}")
  case "$provider" in google) host="accounts.google.com" ;; line) host="access.line.me" ;; esac
  if echo "$body" | grep -q "$host"; then echo "通过  $provider 登录跳转到 $host"; else echo "失败  $provider 登录跳转：$body"; fail=1; fi
done

# 自动建表
tables=$(PGPASSWORD=ci psql -h localhost -U postgres -tAc "select string_agg(table_name, ',' order by table_name) from information_schema.tables where table_schema='public'")
for t in account session user verification; do
  if echo ",$tables," | grep -q ",$t,"; then echo "通过  已自动创建表 $t"; else echo "失败  缺少表 $t（现有：$tables）"; fail=1; fi
done

exit $fail
