import type { NextConfig } from 'next'
import path from 'path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)

const nextConfig: NextConfig = {
    basePath: process.env.CONTEXT_PATH,
    adapterPath: require.resolve('./bun-adapter.ts'),
    reactStrictMode: false,
    images: {
        dangerouslyAllowSVG: true,
        contentDispositionType: 'inline',
        remotePatterns: [
            {
                hostname: '*',
            },
        ],
    },
    outputFileTracingRoot: path.join(path.resolve(), '../../'),
    turbopack: {
        rules: {
            '*.svg': {
                loaders: ['@svgr/webpack'],
                as: '*.js',
            },
        },
    },
    async headers() {
        return [
            {
                source: '/:path*{/}?',
                headers: [
                    {
                        key: 'X-Accel-Buffering',
                        value: 'no',
                    },
                ],
            },
        ]
    },
    experimental: {},
    serverExternalPackages: ['canvas', '@google/earthengine'],
    transpilePackages: ['@packages/shared'],
}

export default nextConfig
