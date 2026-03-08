import { defineConfig } from 'tsup'
import { access, copyFile, mkdir, rm } from 'node:fs/promises'
import config from './package.json'
//@ts-expect-error missing types for bestzip
import bestzip from 'bestzip'
import { replaceTscAliasPaths } from 'tsc-alias'

const outDir = 'app'

async function bundleApp() {
    try {
        console.info('Cleaning up bundle directory')
        await access('./bundle')
        await rm('./bundle', { recursive: true })
    } catch (_e) {
        console.info('Bundle directory does not exist')
    }
    console.info('Creating bundle directory')
    await mkdir('./bundle')
    console.info('Packaging app...')
    const name = `${config.name}-${config.version}.zip`
    await bestzip({
        source: [`./${outDir}/*`, `./.env.example`],
        destination: `./bundle/${name}`,
    })
}

export default defineConfig({
    entry: ['src/app.ts', 'src/routes/**/*.ts', 'src/rabbit/worker.ts'],
    minify: false,
    format: ['esm'],
    splitting: true,
    outDir,
    sourcemap: false,
    bundle: true,
    clean: true,
    treeshake: 'recommended',
    platform: 'node',
    target: 'esnext',
    noExternal: ['@packages/shared'],

    onSuccess: async () => {
        await replaceTscAliasPaths({
            outDir,
        })
        await copyFile('package.prod.json', `${outDir}/package.json`)
        await bundleApp()
    },
})
