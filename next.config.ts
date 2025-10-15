import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    // ppr: 'incremental' //old version, not working anymore // enable Partial Page Rendering (PPR) with incremental mode
    cacheComponents: true // PPR is now enabled via cacheComponents
  }
};

export default nextConfig;
