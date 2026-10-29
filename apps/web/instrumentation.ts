/**
 * 服务启动时执行一次。只在 Node.js 运行时加载迁移代码；
 * 写成 `process.env.NEXT_RUNTIME === 'nodejs'` 的判断，Next 才会把它从 Edge 打包中剔除。
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { migrateOnStartup } = await import('./lib/migrate');
    await migrateOnStartup();
  }
}
