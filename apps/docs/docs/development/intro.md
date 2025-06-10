




# Development Guide

This section provides guidance for developers who want to contribute to or modify the DHIS2 FlexiPortal.

## Project Structure

The project is organized as a monorepo using Yarn workspaces and Turborepo, with the following structure:

- **apps/**
    - **portal/**: The Next.js application that serves as the public-facing portal
    - **manager/**: A DHIS2 custom application for managing portal content
- **packages/**
    - **shared/**: Shared utilities and components used by both apps
    - **ui/**: Reusable UI components
    - **eslint-config/**: Shared ESLint configuration
    - **typescript-config/**: Shared TypeScript configuration

## Prerequisites

- Node.js (version 20 or higher)
- Yarn (version 1.22.x)
- Access to a DHIS2 instance for development

## Setup Instructions

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

## Development Workflow

### Running the Portal App

```bash
# Run the portal app in development mode
yarn dev:portal
```

The portal will be available at http://localhost:3000

### Running the Manager App

```bash
# Run the manager app in development mode
yarn dev:manager
```

The manager app will be available at http://localhost:3001

### Running Both Apps Simultaneously

```bash
# Run both apps in development mode
yarn dev
```

## Testing

### Running End-to-End Tests

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

## Building for Production

```bash
# Build all apps
yarn build

# Build only the portal
yarn portal build

# Build only the manager
yarn manager build
```

## Contributing

1. Create a new branch for your feature or bugfix
2. Make your changes
3. Ensure tests pass
4. Submit a pull request

The project follows semantic versioning and uses conventional commits for automated releases.
