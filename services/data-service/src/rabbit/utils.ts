import logger from '@/logging'
import { PROCESS_NAME } from '@/rabbit/constants'

export function logWorker(type: 'info' | 'error' | 'warn', message: string) {
    const formattedMessage = `[${PROCESS_NAME}] ${message}`
    switch (type) {
        case 'info':
            logger.info(formattedMessage)
            break
        case 'error':
            logger.error(formattedMessage)
            break
        case 'warn':
            logger.warn(formattedMessage)
            break
        default:
            logger.info(formattedMessage)
    }
}
