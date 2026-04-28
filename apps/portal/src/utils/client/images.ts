'use client'

export function useGetImageUrl() {
    return (documentId: string) => `/api/documents/${documentId}/data`
}
