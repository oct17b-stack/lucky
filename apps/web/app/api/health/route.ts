import { ENGINE_VERSION, sunLongitudeProviderName } from '@lucky/core';

export const dynamic = 'force-dynamic';

/** Docker 健康检查与部署后的冒烟测试 */
export function GET() {
  return Response.json({
    ok: true,
    env: process.env.APP_ENV ?? 'development',
    engine: ENGINE_VERSION,
    sunModel: sunLongitudeProviderName(),
    time: new Date().toISOString(),
  });
}
