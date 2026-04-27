import type { NextAdapter } from 'next'
import {
    ADAPTER_NAME,
    createBunAdapter,
    DEFAULT_BUN_ADAPTER_OUT_DIR,
} from './src/adapter'
import {
    createSqliteCacheStores,
    SqliteImageCacheStore,
    SqlitePrerenderCacheStore,
} from './src/runtime/sqlite-cache'

const bunAdapter: NextAdapter = createBunAdapter()

export default bunAdapter
export {
    ADAPTER_NAME,
    DEFAULT_BUN_ADAPTER_OUT_DIR,
    bunAdapter,
    createBunAdapter,
    SqlitePrerenderCacheStore,
    SqliteImageCacheStore,
    createSqliteCacheStores,
}
export type {
    BunAdapterOptions,
    BunDeploymentManifest,
    BunStaticAsset,
} from './src/types.ts'
export type { SqliteCacheOptions } from './src/runtime/sqlite-cache.ts'
