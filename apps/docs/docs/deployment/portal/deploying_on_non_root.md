---
sidebar_position: 3
---

# Deploying on Non-Root URLs

This guide provides instructions for deploying the DHIS2 FlexiPortal on a non-root URL path (e.g., example.com/portal
instead of example.com).

## Overview

By default, the DHIS2 FlexiPortal is configured to run at the root of a domain. However, in some environments, you may
need to deploy it under a specific path. This requires additional configuration to ensure all assets, links, and API
calls work correctly. You will need to manually build the portal application before deployment

## Configuration Steps

### 1. Clone the repository

You need to clone the repository to your server by running:

```bash
git clone --single-branch --branch main https://github.com/hisptz/dhis2-public-portal.git
cd dhis2-public-portal
```

### 2. Set the Base Path

The most important configuration is setting the `CONTEXT_PATH` environment variable.

Create the `.env` file in the `apps/portal/` folder. The file should have the following variables:

- `DHIS2_BASE_URL`: The URL of your DHIS2 instance
- `DHIS2_BASE_PAT_TOKEN`: A Personal Access Token for your DHIS2 instance
- `CONTEXT_PATH`: A subpath where your application will be hosted (e.g `/portal`)

This tells the Next.js application to use `/portal` as the base path for all assets and navigation.

### 3. Building a custom docker image
You can then build your custom docker image by running:

```bash
docker build -t portal:latest . 
```
And then run the created docker image

```bash
docker run -p 3000:3000 -e DHIS2_BASE_URL=https://your-dhis2-instance.org portal:latest
```

You can also use the `docker-comopse-build.yml` file provided to build and run the application using docker compose:

```bash
 docker compose -f docker-compose-build.yml up -d --build 
```

### 4. Reverse Proxy Configuration

When using a reverse proxy like Nginx, you need to configure it to properly handle the base path:

#### Nginx Example

```nginx
server {
    listen 80;
    server_name example.com;

    location /portal {
        proxy_pass http://localhost:3000/portal;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

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
