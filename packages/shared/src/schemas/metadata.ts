import { z } from 'zod'

const appIconSchema = z.object({
    rel: z.string(),
    type: z.string(),
    url: z.string(),
})

export type AppMetaIcon = z.infer<typeof appIconSchema>

export class AppIconFile extends File {
    id?: string

    static async fromFile(file: File) {
        return new AppIconFile([await file.arrayBuffer()], file.name, {
            lastModified: file.lastModified,
            type: file.type,
        })
    }

    setId(id: string) {
        this.id = id
        return this
    }
}

export const metadataSchema = z.object({
    description: z.string(),
    icon: z.string(),
    icons: z.array(appIconSchema),
    name: z.string(),
    applicationURL: z
        .string()
        .url()
        .describe('Where your public portal can be found'),
})

export const metadataFormSchema = z.object({
    name: z.string(),
    description: z.string(),
    icon: z.instanceof(AppIconFile),
    applicationURL: z
        .string()
        .url()
        .refine(
            async (value) => {
                if (!value) return true
                const response = await fetch(`${value}/api/info`)
                if (!response.ok) {
                    return false
                }
                const details = await response.json()
                return details.version //TODO: add version limit checks in the future
            },
            {
                message:
                    'Application URL is not valid. Make sure it points to your running FlexiPortal installation',
            }
        ),
})

export type MetadataForm = z.infer<typeof metadataFormSchema>

export type MetadataConfig = z.infer<typeof metadataSchema>
