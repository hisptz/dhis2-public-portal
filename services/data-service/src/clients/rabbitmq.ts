import axios from 'axios'
import { env } from '@/env'

const host = env.RABBITMQ_HOST
const username = env.RABBITMQ_USER
const password = env.RABBITMQ_PASS

export const rabbitmqClient = axios.create({
    baseURL: host,
    auth: { username, password },
})
