---
sidebar_position: 1
---

# Portal Manager Deployment

The FlexiPortal Manager is a DHIS2 application that allows administrators to configure and manage the Public Portal. This guide provides instructions for deploying the Portal Manager application.

## Deployment Options

The Portal Manager can be deployed in two main ways:

1. **From DHIS2 App Hub** - Installed directly on your DHIS2 instance through the app hub
2. **Manual install** - Installed by downloading the app from the releases pabe

## Deploying as a DHIS2 App

### Prerequisites

- Access to a DHIS2 instance with administrative privileges
- DHIS2 version 2.40 or later

### Installation from DHIS2 App Hub

1. Log in to your DHIS2 instance as an administrator

2. Navigate to App Management (Apps > App Management)
3. Navigate to Custom apps
4. Search for `FlexiPortal Manager` application
5. Click on install
6. After installation, the `FlexiPortal Manager` should appear in your DHIS2 app menu. Click on it to launch the application.

### Manual Installation Steps

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

## Troubleshooting

If you encounter issues with the Portal Manager deployment:

1. **Check DHIS2 Version Compatibility**

   Ensure your DHIS2 instance is version 2.40 or later.

2. **Verify Permissions**

   Make sure your DHIS2 user has the necessary permissions to install apps and access the required API endpoints.

3. **Check Browser Console**

   If the app loads but doesn't function correctly, check your browser's developer console for errors.
