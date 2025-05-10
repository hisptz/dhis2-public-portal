## Security Architecture

### Personal Access Token (PAT) Authentication

The DHIS2 Public Portal uses Personal Access Tokens (PAT) for secure authentication with DHIS2 instances. This approach offers several security advantages:

1. **Server-Side Authentication**: The PAT is stored and used exclusively on the server side, never exposed to client browsers.
2. **Limited Scope**: PATs can be configured with specific permissions in DHIS2, following the principle of least privilege.
3. **Revocable Access**: Tokens can be revoked at any time from the DHIS2 instance if compromised.
4. **No User Context**: The portal operates without requiring end-user authentication, making public health data truly accessible.

### Next.js Security Features

The portal leverages Next.js's advanced security architecture:

1. **Server Components**: The application uses Next.js server components to fetch sensitive data from DHIS2, ensuring credentials remain server-side.
2. **API Routes as Secure Proxy**: Next.js API routes act as a secure proxy between client-side code and the DHIS2 API:
    - Client requests → Next.js API routes → DHIS2 API (with PAT authentication)
    - This architecture prevents direct client access to the DHIS2 instance.

3. **Server Actions**: The "use server" directive is employed for functions that need to access DHIS2, ensuring these operations only execute on the server.

4. **Environment Variable Protection**: Next.js automatically protects environment variables prefixed with `DHIS2_` from being exposed to the client.

### Implementation Details

The security implementation works as follows:

1. The PAT is stored in the `DHIS2_BASE_PAT_TOKEN` environment variable.
2. A server-side HTTP client adds the token to all API requests in the Authorization header: `Authorization: ApiToken ${PAT}`.
3. All data fetching occurs through server components or API routes, never directly from the client.
4. The client receives only the necessary data, with no access to the underlying authentication mechanisms.

This architecture ensures that your DHIS2 instance remains secure while still making selected data publicly accessible through the portal.
