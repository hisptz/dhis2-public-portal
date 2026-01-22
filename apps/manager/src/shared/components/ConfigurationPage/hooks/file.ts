import { useDataMutation } from '@dhis2/app-runtime'
import { LogEntry } from '../utils/configurationUtils'

const fileUploadMutation = {
    resource: 'fileResources',
    type: 'create',
    data: ({ file }: { file: File }) => ({ file, domain: 'DOCUMENT' }),
}

export const useFile = () => {
    // @ts-expect-error mutation issues
    const [mutate] = useDataMutation(fileUploadMutation, {
        onError: (error) => {
            console.error('File upload error:', error.message)
        },
    })

    const uploadFile = async (
        file: Blob,
        filename: string,
        addLog: (message: string, type: LogEntry['type']) => void
    ): Promise<string | null> => {
        try {
            const fileObject = new File([file], filename, { type: file.type })
            const response = (await mutate({ file: fileObject })) as {
                response: { fileResource: { id: string } }
            }
            const fileResourceId = response?.response?.fileResource?.id

            if (!fileResourceId) {
                addLog(
                    `Failed to upload file resource for ${filename}: No ID returned`,
                    'error'
                )
                return null
            }
            return fileResourceId
        } catch (error) {
            addLog(
                `Error uploading file resource for ${filename}: ${error.message}`,
                'error'
            )
            return null
        }
    }

    return { uploadFile }
}
