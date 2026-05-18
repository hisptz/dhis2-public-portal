import { staticItemSchema, AppIconFile } from '@packages/shared/schemas'
import { z } from 'zod'
import i18n from '@dhis2/d2-i18n'

export const staticItemFormSchema = staticItemSchema.extend({
    icon: z
        .instanceof(AppIconFile)
        .refine((file) => file.type === 'image/svg+xml', {
            message: i18n.t('Invalid icon file. Only SVG icons are supported.'),
        })
        .optional(),
})

export type StaticItemFormValues = z.infer<typeof staticItemFormSchema>
