import { z } from 'zod'

const stripEmptyArrays = <T extends Record<string, unknown>>(obj: T) =>
    Object.fromEntries(
        Object.entries(obj).filter(
            ([, v]) => !(Array.isArray(v) && v.length === 0)
        )
    )

export const periodConfigSchema = z
    .object({
        categories: z.array(z.enum(['RELATIVE', 'FIXED'])).optional(),
        periodTypes: z.array(z.string()).optional(),
        periods: z.array(z.string()).optional(),
        singleSelection: z.boolean().optional(),
    })
    .transform(stripEmptyArrays)

export type PeriodConfig = z.infer<typeof periodConfigSchema>

export const orgUnitConfigSchema = z
    .object({
        orgUnitLevels: z.array(z.number()).optional(),
        orgUnits: z.array(z.string()).optional(),
    })
    .transform(stripEmptyArrays)

export type OrgUnitConfig = z.infer<typeof orgUnitConfigSchema>
