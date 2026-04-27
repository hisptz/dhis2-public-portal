import { createBunAdapter } from '@packages/adapter-bun'

export default createBunAdapter({
    outDir: 'apps/portal/server',
    port: 3000,
    cacheHandlerMode: 'sqlite',
})
