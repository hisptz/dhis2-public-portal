#!/usr/bin/env node

import express from 'express'
import { env } from '@/env'
import { initialize } from 'express-openapi'
import { apiDoc } from './openapi'
import path, { dirname } from 'path'
import swagger from 'swagger-ui-express'
import { fileURLToPath } from 'url'
import { connectRabbit } from '@/rabbit/connection'
import logger from '@/logging'

interface HttpError extends Error {
    status?: number
    [key: string]: unknown
}
interface ErrorResponse {
    success: boolean
    error: string
    details?: unknown
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
app.use(express.json())

logger.info(`Initializing FlexiPortal Data Service`)
await initialize({
    app,
    apiDoc: apiDoc,
    paths: path.resolve(__dirname, 'routes'),
    exposeApiDocs: process.env.NODE_ENV !== 'production',
    validateApiDoc: false,
    routesGlob: '**/*.{ts,js,mjs}',
    routesIndexFileRegExp: /(?:index)?\.(m?[tj]s)$/,
    docsPath: `/openapi`,
})

app.get('/', (req, res) => {
    res.send(
        'Hello, Welcome to the DHIS2 Flexiportal Data Service!, Navigate to /docs to view documentation on usage and endpoints'
    )
})
app.use(
    `/docs`,
    swagger.serve,
    swagger.setup(
        {},
        {
            swaggerOptions: {
                url: `/openapi`,
            },
        }
    )
)

app.use((err: HttpError, req: express.Request, res: express.Response): void => {
    console.error('Error:', err)
    const payload: ErrorResponse = {
        success: false,
        error: err.message || 'Unknown server error',
        details: err,
    }

    res.status(err.status || 500).json(payload)
})
app.listen(env.DATA_SERVICE_PORT, async () => {
    await connectRabbit()
    console.log(
        `DHIS2 Data service is running and listening on http://localhost:${env.DATA_SERVICE_PORT}`
    )
})
