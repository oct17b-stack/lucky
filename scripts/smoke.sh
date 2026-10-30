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
check "泰文首页有今日幸运色" 200 "$BASE/th"
contains "泰文首页标题" "สีเสื้อมงคลวันนี้"
check "今日幸运色" 200 "$BASE/th/daily-color"
check "星期一幸运色 SEO 页" 200 "$BASE/th/daily-color/monday"
contains "星期一工作色为绿色" "เขียว"
check "每日运势入口" 200 "$BASE/th/horoscope"
check "星期日出生的每日运势" 200 "$BASE/th/horoscope/sun"
contains "每日运势显示宫位" "ของคุณ"
check "泰国阴历：2026-07-29 为 เดือน 8 หลัง 的วันพระ" 200 "$BASE/th/calendar/2026-07-29"
contains "显示 เดือน 8 หลัง" "เดือน 8 หลัง"
contains "显示วันพระ" "วันพระ"
contains "泰文日期使用佛历" "2569"
check "取名分析" 200 "$BASE/th/name"
check "车牌分析" 200 "$BASE/th/license-plate"
check "配对" 200 "$BASE/th/compatibility"
check "泰式星座" 200 "$BASE/th/thai-zodiac"
check "求签" 200 "$BASE/th/siamsi"
check "塔罗" 200 "$BASE/zh-hans/tarot"
check "幸运壁纸" 200 "$BASE/th/wallpaper"
check "生日星期页含ทักษา表" 200 "$BASE/th/lucky-color/sun"
contains "ทักษา表含กาลกิณี" "กาลกิณี"
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

# 测试账号（内网版）：注册后带 cookie 能拿到会话
check "登录页显示测试账号表单" 200 "$BASE/th/login"
contains "测试账号表单" "บัญชีทดสอบ"
JAR=$(mktemp)
code=$(curl -s -o /tmp/smoke-body -w "%{http_code}" -c "$JAR" -X POST "$BASE/api/auth/sign-up/email" \
  -H "Content-Type: application/json" -H "Origin: $BASE" \
  -d '{"name":"CI","email":"ci@example.com","password":"ci-password-123"}')
if [ "$code" = "200" ]; then echo "通过  测试账号注册（200）"; else echo "失败  测试账号注册：$code $(head -c 300 /tmp/smoke-body)"; fail=1; fi
check "测试账号会话" 200 "$BASE/api/auth/get-session" -b "$JAR"
contains "会话包含测试邮箱" "ci@example.com"
check "登录后可访问我的页面" 200 "$BASE/th/me" -b "$JAR"

# 自动建表
tables=$(PGPASSWORD=ci psql -h localhost -U postgres -tAc "select string_agg(table_name, ',' order by table_name) from information_schema.tables where table_schema='public'")
for t in account session user verification; do
  if echo ",$tables," | grep -q ",$t,"; then echo "通过  已自动创建表 $t"; else echo "失败  缺少表 $t（现有：$tables）"; fail=1; fi
done

# 正式版模式：即使误设 ENABLE_TEST_LOGIN=true，测试账号也必须关闭
kill $SERVER_PID 2>/dev/null || true
wait $SERVER_PID 2>/dev/null || true
(cd apps/web && APP_ENV=production ENABLE_TEST_LOGIN=true pnpm exec next start --port 3000 >"$LOG" 2>&1) &
SERVER_PID=$!
for i in $(seq 1 60); do
  curl -fsS "$BASE/api/health" >/dev/null 2>&1 && break
  sleep 1
done
code=$(curl -s -o /tmp/smoke-body -w "%{http_code}" -X POST "$BASE/api/auth/sign-up/email" \
  -H "Content-Type: application/json" -H "Origin: $BASE" \
  -d '{"name":"CI2","email":"ci2@example.com","password":"ci-password-123"}')
if [ "$code" != "200" ]; then echo "通过  正式版拒绝测试账号注册（$code）"; else echo "失败  正式版居然允许测试账号注册"; fail=1; fi
check "正式版登录页" 200 "$BASE/th/login"
if grep -q "บัญชีทดสอบ" /tmp/smoke-body; then echo "失败  正式版登录页出现测试账号表单"; fail=1; else echo "通过  正式版登录页没有测试账号表单"; fi

exit $fail
