import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
    reactStrictMode: false,
    basePath: process.env.NEXT_PUBLIC_CONTEXT_PATH ?? '',
    images: {
        dangerouslyAllowSVG: true,
        contentDispositionType: 'inline',
        remotePatterns: [
            {
                hostname: '*',
            },
        ],
    },
    output: 'standalone',
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
