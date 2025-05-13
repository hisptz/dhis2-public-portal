---
sidebar_position: 1
---

# Deploying using Docker

Docker is the recommended method for deploying the DHIS2 FlexiPortal in production environments. This guide will walk
you through the process of deploying the Portal using Docker.

## Prerequisites

Before you begin, ensure you have the following:

- Docker installed on your server
- Docker Compose installed (optional, but recommended)
- Access to a DHIS2 instance
- Basic knowledge of Docker and containerization

## Using Pre-built Docker Images

The easiest way to deploy the Portal is to use the pre-built Docker images available on Docker Hub.

### Using Docker Run

```bash
docker run -p 3000:3000 -e DHIS2_BASE_URL=https://your-dhis2-instance.org hisptanzania/dhis2-public-portal:latest
```

### Using Docker Compose (Recommended)

Create a `docker-compose.yml` file with the following content:

```yaml
services:
  portal:
    image: hisptanzania/dhis2-public-portal:latest
    user: "1001:1001"
    ports:
      - "3000:3000"
    env_file:
      - .env
    volumes:
      - public:/app/apps/portal/public
volumes:
  public:
```

Create a `.env` file in the same directory with your configuration:

```
DHIS2_BASE_URL=https://your-dhis2-instance.org
# Add any other environment variables needed
```

Then run:

```bash
docker-compose up -d
```

## Building Your Own Docker Image

If you need to customize the Portal, you can build your own Docker image.

1. Clone the repository:
   ```bash
   git clone https://github.com/hisptz/dhis2-public-portal.git
   cd dhis2-public-portal
   ```

2. Build the Docker image:
   ```bash
   docker build -t my-portal:latest .
   ```

3. Run the container:
   ```bash
   docker run -p 3000:3000 -e DHIS2_BASE_URL=https://your-dhis2-instance.org my-portal:latest
   ```

## Environment Variables

The Portal Docker container can be configured using the following environment variables:

| Variable             | Description                                              | Default | Required |
|----------------------|----------------------------------------------------------|---------|----------|
| DHIS2_BASE_URL       | URL of your DHIS2 instance                               | -       | Yes      |
| DHIS2_BASE_PAT_TOKEN | DHIS2 PAT for authenticating your DHIS2 instance         | -       | Yes      |
| CONTEXT_PATH         | Base path for the application (for non-root deployments) | /       | No       |

## Deploying Behind a Reverse Proxy

For production deployments, it's recommended to run the Portal behind a reverse proxy like Nginx or Apache. This allows
you to:

- Terminate SSL/TLS
- Handle multiple applications on the same server
- Implement caching and other optimizations

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name portal.example.org;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Updating the Portal

To update the Portal to a newer version:

1. Pull the latest image:
   ```bash
   docker pull hisptanzania/dhis2-public-portal:latest
   ```

2. Restart your container:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

## Troubleshooting

If you encounter issues with your Docker deployment:

1. Check the container logs:
   ```bash
   docker logs <container_id>
   ```

2. Verify your environment variables are correctly set
3. Ensure your DHIS2 instance is accessible from the Docker container
4. Check if there are any network issues or firewall rules blocking communication
