import { Operation } from 'express-openapi'
import { version } from '../../../package.json'

export const GET: Operation = async () => {
    return {
        version,
    }
}

GET.apiDoc = {
    description: 'Get the version of the service',
    tags: ['info'],
    responses: {
        '200': {
            description: 'OK',
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            version: { type: 'string' },
                        },
                    },
                },
            },
        },
    },
}
