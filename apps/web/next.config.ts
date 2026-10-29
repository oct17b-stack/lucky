import path from 'node:path';
import type { NextConfig } from 'next';

const isStaging = process.env.APP_ENV === 'staging';

const nextConfig: NextConfig = {
  // 独立输出：Docker 镜像只需要 .next/standalone，适合部署到 NAS
  output: 'standalone',
  // monorepo：从仓库根目录追踪依赖，standalone 产物里才会包含 packages/*
  outputFileTracingRoot: path.resolve(process.cwd(), '../..'),
  // 共享包以 TypeScript 源码形式发布，由 Next.js 负责编译
  transpilePackages: ['@lucky/core', '@lucky/content'],
  poweredByHeader: false,
  async headers() {
    if (!isStaging) return [];
    // 测试版全站禁止搜索引擎收录，避免和正式站抢 SEO
    return [{ source: '/:path*', headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] }];
  },
};

export default nextConfig;
