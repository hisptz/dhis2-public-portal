import { describe, expect, it } from 'vitest'
import { isUid, resolveProxyTarget } from './proxyGuard'

const sp = (q = '') => new URLSearchParams(q)

describe('resolveProxyTarget', () => {
    it.each([
        [['analytics'], 'dimension=dx:abc&filter=pe:2025', true],
        [
            ['organisationUnits'],
            'fields=id,displayName&filter=id:in:[a,b]',
            true,
        ],
        [['geoFeatures'], 'ou=ou:LEVEL-2', true],
        [['legendSets', 'AbCdEfGhIjK'], 'fields=id,name', true],
        [['tokens', 'google'], '', true],
    ])('allows %j', (segments, query) => {
        const result = resolveProxyTarget(segments, sp(query))
        expect(result).toBe(
            query
                ? `${segments.join('/')}?${sp(query).toString()}`
                : segments.join('/')
        )
    })

    it.each([
        [['me'], 'x=analytics'],
        [['system', 'info'], 'analytics'],
        [['users', 'abc', 'analytics'], ''],
        [['analytics', 'sub'], ''],
        [['analytics', '..', 'me'], ''],
        [['analytics', '%2e%2e', 'me'], ''],
        [['analytics', 'a%2fb'], ''],
        [['analytics', 'a\\b'], ''],
        [['analytics', ''], ''],
        [['legendSets'], ''],
        [['legendSets', 'not-a-uid'], ''],
        [[], ''],
        [['analytics'], 'x=/api/me'],
        [['analytics'], '/api/me='],
        [['analytics'], 'x=https://evil.example/'],
    ])('rejects %j ?%s', (segments, query) => {
        expect(resolveProxyTarget(segments, sp(query))).toBeNull()
    })
})

describe('isUid', () => {
    it('accepts DHIS2 UIDs only', () => {
        expect(isUid('AbCdEfGhIjK')).toBe(true)
        expect(isUid('1bCdEfGhIjK')).toBe(false)
        expect(isUid('short')).toBe(false)
        expect(isUid('x/../me')).toBe(false)
    })
})
