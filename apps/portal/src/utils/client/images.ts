'use client'

export function useGetImageUrl() {
    if (process.env.NEXT_PUBLIC_CONTEXT_PATH) {
        return (documentId: string) =>
            `${process.env.NEXT_PUBLIC_CONTEXT_PATH}/api/documents/${documentId}/data`
    }
    return (documentId: string) => `/api/documents/${documentId}/data`
}
