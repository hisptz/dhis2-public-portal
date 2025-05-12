---
sidebar_position: 1
---

# Portal Deployment

The DHIS2 Public Portal is a Next.js application that can be deployed in various ways. This section provides documentation for different deployment methods.

## Deployment Options

The Portal can be deployed using the following methods:

### [Docker Deployment](./deploy_using_docker.md)

Docker is the recommended method for production deployments. It provides a consistent environment and makes it easy to update the application.

### [Vercel Deployment](./deploy_to_vercel.md)

Vercel is a cloud platform for static sites and Serverless Functions that's optimized for Next.js applications. It provides a simple deployment process with automatic CI/CD.

If you need to deploy the Portal on a non-root path (e.g., example.com/portal instead of example.com), [this guide](./deploying_on_non_root.md)  provides instructions for configuring the application accordingly.

## Choosing a Deployment Method

When deciding how to deploy the Portal, consider the following factors:

- **Infrastructure**: If you already have Docker infrastructure in place, Docker deployment might be the most straightforward option.
- **Simplicity**: Vercel provides the simplest deployment experience with minimal configuration.
- **Integration**: If you need to integrate with existing systems or deploy alongside other applications, non-root path deployment might be necessary.
- **Customization**: Docker provides the most flexibility for customization.

## Requirements

Regardless of the deployment method, the Portal requires:

- A DHIS2 instance accessible from the Portal server
- Node.js 20+ (for non-Docker deployments)
- Proper configuration of environment variables

## Next Steps

Choose one of the deployment methods above to get started with deploying the DHIS2 Public Portal.
