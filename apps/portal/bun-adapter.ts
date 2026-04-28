import { createBunAdapter } from 'adapter-bun'

export default createBunAdapter({
    outDir: 'server',
    port: 3000,
    cacheHandlerMode: 'sqlite',
})
