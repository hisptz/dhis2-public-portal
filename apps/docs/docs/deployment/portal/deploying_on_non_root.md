---
sidebar_position: 3
---

# Deploying on Non-Root URLs

This guide provides instructions for deploying the DHIS2 Public Portal on a non-root URL path (e.g., example.com/portal instead of example.com).

## Overview

By default, the DHIS2 Public Portal is configured to run at the root of a domain. However, in some environments, you may need to deploy it under a specific path. This requires additional configuration to ensure all assets, links, and API calls work correctly.

## Configuration Steps

### 1. Set the Base Path

The most important configuration is setting the `CONTEXT_PATH` environment variable:

```bash
CONTEXT_PATH=/portal
```

This tells the Next.js application to use `/portal` as the base path for all assets and navigation.

### 2. Update Next.js Configuration

If you're building a custom version of the Portal, ensure the `next.config.js` file includes the correct base path configuration:

```javascript
const nextConfig = {
  basePath: process.env.CONTEXT_PATH || '',
  // other configuration...
}
```

### 3. Docker Deployment on Non-Root Path

When using Docker, set the `CONTEXT_PATH` environment variable:

```bash
docker run -p 3000:3000 \
  -e DHIS2_BASE_URL=https://your-dhis2-instance.org \
  -e CONTEXT_PATH=/portal \
  hisptanzania/dhis2-public-portal:latest
```

Or in your docker-compose.yml:

```yaml
services:
  portal:
    image: hisptanzania/dhis2-public-portal:latest
    ports:
      - "3000:3000"
    environment:
      - DHIS2_BASE_URL=https://your-dhis2-instance.org
      - CONTEXT_PATH=/portal
```

### 4. Reverse Proxy Configuration

When using a reverse proxy like Nginx, you need to configure it to properly handle the base path:

#### Nginx Example

```nginx
server {
    listen 80;
    server_name example.com;

    location /portal {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### Apache Example

```apache
<VirtualHost *:80>
    ServerName example.com

    ProxyPreserveHost On
    ProxyPass /portal http://localhost:3000
    ProxyPassReverse /portal http://localhost:3000
</VirtualHost>
```

## Vercel Deployment on Non-Root Path

When deploying to Vercel with a non-root path:

1. Set the `CONTEXT_PATH` environment variable in your Vercel project settings
2. If you're using a custom domain with path-based routing, additional configuration may be required in your DNS settings

## Troubleshooting

If you encounter issues with non-root path deployment:

1. **Missing Assets**: Check that all asset URLs include the correct base path
2. **Navigation Issues**: Ensure all internal links include the base path
3. **API Calls**: Verify that API calls are using the correct paths
4. **404 Errors**: Check your reverse proxy configuration to ensure requests are being properly routed

## Limitations

When deploying on a non-root path:

- Some features may require additional configuration
- Deep linking and sharing links may require special handling
- SEO considerations may be different than with root deployments
