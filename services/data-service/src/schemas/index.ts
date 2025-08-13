export interface Pager {
    page: number,
    total: number
    pageSize: number;
    nextPage?: string;
    pageCount: number;
}

export interface OrgUnit {
    id: string;
    geometry: {
        type: string;
        coordinates: number[]
    }
    displayName: string;
}
