import { AxiosError } from 'axios'

export class QueuedJobError extends Error {
    requeue: boolean
    errorObject?: Record<string, unknown>
    constructor(
        message: string,
        requeue: boolean = false,
        options?: { errorObject?: Record<string, unknown> }
    ) {
        super(message)
        this.requeue = requeue
        this.errorObject = options?.errorObject
    }
}

export function handleError(error: AxiosError | Error) {
    if (error instanceof AxiosError) {
        handleAxiosPostError(error)
    } else {
        throw new QueuedJobError(error.message, false)
    }
}

export function handleAxiosPostError(error: AxiosError) {
    if (error.status === 409) {
        const response = error.response?.data as Record<string, unknown>
        console.log({
            response,
            error,
        })
        throw new QueuedJobError(error.message, false, {
            errorObject: response,
        })
    }
}
