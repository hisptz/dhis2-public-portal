/*
 * Guard for the public API proxy routes.
 *
 * The target path is always built from the parsed route segments (never by
 * slicing the raw request URL) and must fully match one of the allowed
 * resources. Query parameters are not allowlisted per key (see the proxy
 * guide in the docs), but they are screened for attempts to redirect the
 * forwarded target. Size limits on the query are intentionally not applied yet.
 */

const UID_PATTERN = '[A-Za-z][A-Za-z0-9]{10}'
const UID_REGEX = new RegExp(`^${UID_PATTERN}$`)

const ALLOWED_PATHS: RegExp[] = [
    /^analytics$/,
    /^organisationUnits$/,
    /^geoFeatures$/,
    new RegExp(`^legendSets/${UID_PATTERN}$`),
    /^tokens\/google$/,
]

export function isUid(value: string): boolean {
    return UID_REGEX.test(value)
}

function hasUnsafeSegment(segments: string[]): boolean {
    return (
        segments.length === 0 ||
        segments.some((s) => !s || s === '.' || s === '..' || /[\\/%]/.test(s))
    )
}

function hasUnsafeQuery(searchParams: URLSearchParams): boolean {
    for (const [key, value] of searchParams) {
        // Reject values that try to point the request somewhere else
        if (/(^|[^A-Za-z])api\//i.test(`${key}${value}`)) return true
        if (/^[a-z][a-z0-9+.-]*:\/\//i.test(value)) return true
    }
    return false
}

/**
 * Returns the DHIS2-relative path (with query string) to forward, or null
 * if the request is not allowed.
 */
export function resolveProxyTarget(
    segments: string[],
    searchParams: URLSearchParams
): string | null {
    if (hasUnsafeSegment(segments)) return null

    const path = segments.join('/')
    if (!ALLOWED_PATHS.some((regex) => regex.test(path))) return null

    if (hasUnsafeQuery(searchParams)) return null

    const query = searchParams.toString()
    return query ? `${path}?${query}` : path
}
