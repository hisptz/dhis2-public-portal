# Customizable DHIS2 Public Portal

[![semantic-release: angular](https://img.shields.io/badge/semantic--release-angular-e10079?logo=semantic-release&style=for-the-badge)](https://github.com/semantic-release/semantic-release)
[![DHIS2 Public Portal](https://img.shields.io/endpoint?url=https://cloud.cypress.io/badge/detailed/qufv5j&style=for-the-badge&logo=cypress&label=Portal)](https://cloud.cypress.io/projects/qufv5j/runs)
[![DHIS2 Public Portal Manager](https://img.shields.io/endpoint?url=https://cloud.cypress.io/badge/detailed/usucz3&style=for-the-badge&logo=cypress&label=Manager)](https://cloud.cypress.io/projects/usucz3/runs)

## Introduction

Overview
The Customizable Health Portal is a dynamic, publicly accessible web platform designed to transform how national health
data is shared, accessed, and understood. At its core, it brings together up-to-date, visualized, and aggregated health
data from DHIS2 systems and enhances it with a suite of essential resources, including strategic reports, guidelines,
dashboards, and knowledge libraries, all in one unified, user-friendly space.
But this portal does more than just display data. It solves a real and recurring challenge:

> Public health data is often meant to be open, but accessing it requires permissions and technical know-how.

This leaves researchers, media, civil society, development partners, and even some ministry departments struggling to
engage with the very data that’s meant to drive progress.

## Deployment

### Portal Manager

The portal manager is a DHIS2 custom application. You can install it through the App Hub or download it from
the [releases](https://github.com/hisptz/dhis2-public-portal/releases) page and manually install it in your DHIS2
instance

### Portal

There are several ways we support deploying your portal application

#### Vercel

You can quickly deploy the application through vercel by clicking the button below.
This requires you to have a [vercel](https://vercel.com/) account.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hisptz/dhis2-public-portal&env=DHIS2_BASE_URL,DHIS2_BASE_PAT_TOKEN&envDescription=The%20DHIS2%20base%20URL%20and%20PAT%20token%20variables%20enable%20you%20to%20connect%20your%20deployed%20portal%20to%20a%20DHIS2%20instance&project-name=dhis2-public-portal&repository-name=dhis2-public-portal&root-directory=apps/portal&install-command=yarn%20install&build-command=turbo%20build%20--filter%20portal&skip-unaffected=true)

#### Docker

You can run the portal app in docker by using the following command:

```bash
docker run -d \
  -p 3000:3000 \
  -e DHIS2_BASE_URL=https://your-dhis2-instance.org \
  -e DHIS2_BASE_PAT_TOKEN=your-personal-access-token \
  --name dhis2-public-portal \
  hisptanzania/dhis2-public-portal:latest
```

You can also use `docker compose` with this docker-compose.yml file:

```yaml
services:
  portal:
    image: hisptanzania/dhis2-public-portal:latest
    ports:
      - "3000:3000"
    env_file:
      - .env
    volumes:
      - public:/app/apps/portal/public

volumes:
  public:
```

Save this to a file named `docker-compose.yml` and run:

```bash
docker-compose up -d
```

### Environment Variables

The following environment variables are required in the `.env` file:

- `DHIS2_BASE_URL`: The URL of your DHIS2 instance
- `DHIS2_BASE_PAT_TOKEN`: A Personal Access Token for your DHIS2 instance

### Deploying on non root URLs

In cases where your application will be available through a subpath (e.g https://example.org/some/path, you will need to
build the app yourself before deploying. 

Before building your application, make sure to set the `CONTEXT_PATH` to the desired subpath. For example, the URL https://example.org/some/path' the subpath is `/some/path`

### Docker
To build and run the application as a docker container, clone this repository to your server. 

```bash 
git clone --single-branch --branch main https://github.com/hisptz/dhis2-public-portal.git
```

Then create the `.env` file in the `apps/portal/` folder. The file should have the following variables:

- `DHIS2_BASE_URL`: The URL of your DHIS2 instance
- `DHIS2_BASE_PAT_TOKEN`: A Personal Access Token for your DHIS2 instance
- `CONTEXT_PATH`: A subpath where your application will be hosted

Then run;

```bash
 docker compose -f docker-compose-build.yml up -d --build 
```






## Development Guide

This section provides guidance for developers who want to contribute to or modify the DHIS2 Public Portal.

### Project Structure

The project is organized as a monorepo using Yarn workspaces and Turborepo, with the following structure:

- **apps/**
  - **portal/**: The Next.js application that serves as the public-facing portal
  - **manager/**: A DHIS2 custom application for managing portal content
- **packages/**
  - **shared/**: Shared utilities and components used by both apps
  - **ui/**: Reusable UI components
  - **eslint-config/**: Shared ESLint configuration
  - **typescript-config/**: Shared TypeScript configuration

### Prerequisites

- Node.js (version 20 or higher)
- Yarn (version 1.22.x)
- Access to a DHIS2 instance for development

### Setup Instructions

1. Clone the repository:
   ```bash
   git clone https://github.com/hisptz/dhis2-public-portal.git
   cd dhis2-public-portal
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

3. Set up environment variables:
   - For the portal app, create a `.env` file in `apps/portal/` with:
     ```
     DHIS2_BASE_URL=https://your-dhis2-instance.org
     DHIS2_BASE_PAT_TOKEN=your-personal-access-token
     ```
   - For the manager app, create a `.env` file in `apps/manager/` with:
     ```
     DHIS2_PROXY_URL=https://your-dhis2-instance.org
     ```

### Development Workflow

#### Running the Portal App

```bash
# Run the portal app in development mode
yarn dev:portal
```

The portal will be available at http://localhost:3000

#### Running the Manager App

```bash
# Run the manager app in development mode
yarn dev:manager
```

The manager app will be available at http://localhost:3001

#### Running Both Apps Simultaneously

```bash
# Run both apps in development mode
yarn dev
```

### Testing

#### Running End-to-End Tests

The project uses Cypress for end-to-end testing:

```bash
# Run portal e2e tests
yarn portal test:e2e

# Run portal e2e tests with UI
yarn portal test:e2e-open

# Run manager e2e tests
yarn manager test:e2e

# Run manager e2e tests with UI
yarn manager test:e2e-open
```

### Building for Production

```bash
# Build all apps
yarn build

# Build only the portal
yarn portal build

# Build only the manager
yarn manager build
```

### Publishing the Manager App to DHIS2 App Hub

```bash
yarn manager publish:app-hub
```

### Contributing

1. Create a new branch for your feature or bugfix
2. Make your changes
3. Ensure tests pass
4. Submit a pull request

The project follows semantic versioning and uses conventional commits for automated releases.

