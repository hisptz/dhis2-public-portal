---
sidebar_position: 1
---

# Portal Manager Deployment

The DHIS2 Portal Manager is a DHIS2 application that allows administrators to configure and manage the Public Portal. This guide provides instructions for deploying the Portal Manager application.

## Deployment Options

The Portal Manager can be deployed in two main ways:

1. **As a DHIS2 App** - Installed directly on your DHIS2 instance (recommended)
2. **Standalone** - Run as a standalone application connecting to a DHIS2 instance

## Deploying as a DHIS2 App

### Prerequisites

- Access to a DHIS2 instance with administrative privileges
- DHIS2 version 2.38 or later

### Installation Steps

1. **Download the App**

   Download the latest version of the Portal Manager app from the [releases page](https://github.com/hisptz/dhis2-public-portal/releases) or build it yourself.

2. **Upload to DHIS2**

   a. Log in to your DHIS2 instance as an administrator

   b. Navigate to App Management (Apps > App Management)

   c. Click on "Upload App"

   d. Select the downloaded .zip file

   e. Click "Upload"

3. **Verify Installation**

   After installation, the Portal Manager should appear in your DHIS2 app menu. Click on it to launch the application.

## Building from Source

If you want to build the Portal Manager app from source:

1. **Clone the Repository**

   ```bash
   git clone https://github.com/hisptz/dhis2-public-portal.git
   cd dhis2-public-portal
   ```

2. **Install Dependencies**

   ```bash
   yarn install
   ```

3. **Build the App**

   ```bash
   yarn manager build
   ```

   This will create a build in the `apps/manager/build` directory.

4. **Create a Deployable ZIP**

   ```bash
   cd apps/manager
   yarn pack
   ```

   This will create a .zip file that can be uploaded to DHIS2.

## Deploying to Development DHIS2 Instance

For development purposes, you can deploy directly to a DHIS2 instance:

1. **Configure Environment Variables**

   Create a `.env` file in the `apps/manager` directory with:

   ```
   DHIS2_BASE_URL=https://your-dhis2-instance.org
   ```

2. **Deploy**

   ```bash
   cd apps/manager
   yarn deploy --username YOUR_USERNAME https://your-dhis2-instance.org
   ```

   You will be prompted for your password.

## Standalone Deployment

While not recommended for production, you can run the Portal Manager as a standalone application:

1. **Start Development Server**

   ```bash
   yarn manager dev
   ```

   This will start the application on port 3001.

2. **Configure DHIS2 Connection**

   You'll need to configure the application to connect to your DHIS2 instance by setting the `DHIS2_BASE_URL` environment variable.

## Troubleshooting

If you encounter issues with the Portal Manager deployment:

1. **Check DHIS2 Version Compatibility**

   Ensure your DHIS2 instance is version 2.38 or later.

2. **Verify Permissions**

   Make sure your DHIS2 user has the necessary permissions to install apps and access the required API endpoints.

3. **Check Browser Console**

   If the app loads but doesn't function correctly, check your browser's developer console for errors.

4. **CORS Issues**

   If running in standalone mode, you might encounter CORS issues. Ensure your DHIS2 instance is configured to allow requests from the Portal Manager's origin.
