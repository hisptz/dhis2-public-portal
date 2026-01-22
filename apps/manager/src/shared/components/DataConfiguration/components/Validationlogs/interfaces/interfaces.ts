import {
    DataServiceConfig,
    DataServiceRunStatus,
} from '@packages/shared/schemas'
import { ValidationPhase } from '../hooks/validation'

export interface ValidationLogEntry {
    id: string
    timestamp: string
    level: 'info' | 'warn' | 'error' | 'success'
    message: string
    metadata?: any
}
export interface ValidationSummary {
    configId: string
    status: DataServiceRunStatus
    startTime: string
    endTime?: string
    totalRecords: number
    recordsProcessed: number
    recordsMatched: number
    discrepanciesFound: number
    criticalDiscrepancies: number
    majorDiscrepancies: number
    minorDiscrepancies: number
    progress: number
    lastActivity?: string
    phase?: ValidationPhase
    phaseMessage?: string
}

export interface ValidationDiscrepancy {
    id: string
    dataElement: string
    dataElementName: string
    orgUnit: string
    orgUnitName: string
    period: string
    categoryOptionCombo: string
    attributeOptionCombo?: string
    sourceValue: string | number | null
    destinationValue: string | number | null
    discrepancyType:
        | 'missing_in_destination'
        | 'missing_in_source'
        | 'value_mismatch'
        | 'metadata_mismatch'
    severity: 'critical' | 'major' | 'minor'
    details?: string
}
export interface ValidationLogsResponse {
    success: boolean
    configId: string
    logs: ValidationLogEntry[]
    summary: ValidationSummary
    pagination?: {
        limit: number
        offset: number
        total: number
        hasMore: boolean
    }
}

export interface ValidationDiscrepanciesResponse {
    success: boolean
    configId: string
    discrepancies: ValidationDiscrepancy[]
    summary: {
        total: number
        critical: number
        major: number
        minor: number
        byType: Record<string, number>
        byDataElement: Record<string, number>
    }
    pagination?: {
        limit: number
        offset: number
        total: number
        hasMore: boolean
    }
}
export interface ValidationSession {
    configId: string
    status: DataServiceRunStatus
    startTime: string
    endTime?: string
    logs: ValidationLogEntry[]
    discrepancies: ValidationDiscrepancy[]
    summary: ValidationSummary
    config: {
        dataItemsConfigIds: string[]
        runtimeConfig: any
        sourceConfig: DataServiceConfig
    }
}
