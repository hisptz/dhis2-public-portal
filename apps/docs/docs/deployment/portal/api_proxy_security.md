---
sidebar_position: 5
---

# API Proxy and Token Security

The portal exposes a small, read-only proxy under `/api/*` so the browser can render charts, maps and tables
without ever seeing the server's Personal Access Token (PAT). This page describes what the proxy allows and how
implementers should configure the DHIS2 account behind the PAT.

## What the proxy allows

Only `GET` requests, and only these paths (the whole path must match):

| Path                   | Used for                               |
| ---------------------- | -------------------------------------- |
| `analytics`            | Chart, table and map data              |
| `organisationUnits`    | Organisation unit names and paths      |
| `geoFeatures`          | Map boundaries                         |
| `legendSets/{uid}`     | Map and table legends                  |
| `tokens/google`        | Google Earth Engine layers             |
| `icons/{uid}/icon`     | Icons (dedicated route)                |
| `documents/{uid}/data` | Documents and images (dedicated route) |

Anything else returns `404`. Query strings are not size-limited for now, but
values that try to redirect the request (for example containing `api/` or an absolute URL) are rejected.

## Query parameters the portal sends (reference)

The proxy does not enforce a per-key allowlist, so DHIS2 permissions are the main protection for what the
allowed paths can return. These are the parameters the portal itself uses:

- `analytics`: `dimension`, `filter`, `displayProperty=NAME`, `includeMetadataDetails=true`, `relativePeriodDate`
- `organisationUnits`: `fields=id,displayName,path,level`, `filter=id:in:[...]`
- `geoFeatures`: `ou`, `displayProperty` (sent by the map library)
- `legendSets/{uid}`: `fields` (sent by the map library)

## Configure a minimal-privilege token

The PAT is the real security boundary. Create a dedicated DHIS2 user for the portal and:

1. Give it **no** superuser or admin authorities. Read access to public data only.
2. Share only the dashboards, visualizations, maps, data sets and organisation units that are meant to be public.
3. Set an **expiry** on the PAT, restrict **allowed IPs** to the portal host when possible, and rotate it regularly.
4. Never reuse a personal or administrator account.

Assume anything the token can read through the allowed paths may be requested by the public.
