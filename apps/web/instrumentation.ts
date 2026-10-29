/**
 * 服务启动时执行一次。AUTO_MIGRATE=true 时自动创建或补齐账号相关的表，
 * 这样 NAS 测试版拉取新镜像重启后不需要手动迁移数据库。
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs' || process.env.AUTO_MIGRATE !== 'true' || !process.env.DATABASE_URL) return;
  const { getMigrations } = await import('better-auth/db/migration');
  const { auth } = await import('./lib/auth');
  const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(auth.options);
  if (toBeCreated.length === 0 && toBeAdded.length === 0) return;
  await runMigrations();
  console.log(`[migrate] 账号表已更新：新建 ${toBeCreated.length} 张表，补充 ${toBeAdded.length} 处字段`);
}
