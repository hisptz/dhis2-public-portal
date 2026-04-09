import path from 'path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

const viteConfig = defineConfig(async (configEnv) => {
    const { mode } = configEnv
    return {
        plugins: [
            // tanstackRouter({
            //     target: 'react',
            //     autoCodeSplitting: true,
            //     routesDirectory: '../../src/modules',
            //     generatedRouteTree: '../../src/routeTree.gen.ts',
            //     verboseFileRoutes: true,
            //     enableRouteGeneration: true,
            // }),
            tailwindcss(),
        ],
        // In dev environments, don't clear the terminal after files update
        clearScreen: mode !== 'development',
        // Use an import alias: import from '@/' anywhere instead of 'src/'
        resolve: {
            alias: { '@': path.resolve(__dirname, 'src') },
            dedupe: [
                'react',
                'react-dom',
                'react/jsx-runtime',
                '@tanstack/react-query',
                '@dhis2/app-runtime',
            ],
        },
        // ...other config options here,
    }
})

export default viteConfig
