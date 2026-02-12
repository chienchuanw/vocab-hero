import type { NextConfig } from 'next';
import bundleAnalyzer from '@next/bundle-analyzer';
import createNextIntlPlugin from 'next-intl/plugin';

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  output: process.env.STANDALONE === 'true' ? 'standalone' : undefined,
  images: process.env.STANDALONE === 'true' ? { unoptimized: true } : {},
};

export default withNextIntl(withBundleAnalyzer(nextConfig));
