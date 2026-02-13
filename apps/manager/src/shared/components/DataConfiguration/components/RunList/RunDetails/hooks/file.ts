import { useWatch } from "react-hook-form"
import type { DataServiceConfig } from "@packages/shared/schemas"
import { useAlert, useConfig } from "@dhis2/app-runtime"
import { useState } from "react"
import i18n from "@dhis2/d2-i18n";

export function useFailedTaskDownload({
    runId,
    taskId,
    type,
}: {
    runId: string
    taskId: string
    type: "metadata" | "data"
}) {
    const { baseUrl } = useConfig();
    const config = useWatch<DataServiceConfig>()
    const [loading, setLoading] = useState(false)
    const { show, hide } = useAlert(
        ({ message }) => message,
        ({ type }) => ({ ...type, duration: 3000 })
    )

    const getErrorMessage = (err: unknown) => {
        if (err instanceof Error) return err.message
        if (typeof err === "string") return err
        return i18n.t("Unknown error")
    }

    const download = async () => {
        if (!config?.id || !type || !runId || !taskId) return

        setLoading(true)

        try {
            hide()
            const url = `${baseUrl}/api/routes/data-service/run/${config.id}/${type}/${runId}/${taskId}/file`

            const res = await fetch(url, {
                method: "GET",
                credentials: "include",
            })

            if (!res.ok) {
                throw new Error(`Error: ${res.status} File ${res.statusText}`)
            }


            const blob = await res.blob()

            const objectUrl = URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = objectUrl

            const disposition = res.headers.get("Content-Disposition")
            const filename = disposition?.match(/filename\*=UTF-8''(.+)/)?.[1] ||
                disposition?.match(/filename="?([^"]+)"?/)?.[1] ||
                `${taskId}.json`
            a.download = filename

            document.body.appendChild(a)
            a.click()

            a.remove()
            URL.revokeObjectURL(objectUrl)
            show({
                message: i18n.t('File downloaded successfully'),
                type: { success: true },
            })
        } catch (error) {
            show({
                message: getErrorMessage(error),
                type: { critical: true },
            })
        } finally {
            setLoading(false)
        }
    }
    return { download, loading }
}
