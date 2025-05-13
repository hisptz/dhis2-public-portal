---
sidebar_position: 3
---

# Deploying using PM2

[PM2](https://pm2.keymetrics.io/) is a production process manager for Node.js applications that helps you keep your app
alive forever and reload it without downtime.

## Prerequisites

This requires you to have `node > 20` installed in your sytem.

## Deployment steps

To deploy the portal app using PM2:

### 1. Download the `portal` application from the [releases](https://github.com/hisptz/dhis2-public-portal/releases) page

```bash
# Make sure to replace `<app-version>` with the intended version of the app.
   wget https://github.com/hisptz/dhis2-public-portal/releases/download/v<app-version>/portal-<app-version>.zip -O portal.zip
```
### 2. Unzip the portal app

```bash
   unzip portal.zip -d portal
```
### 3. Navigate to the portal folder

```bash
cd portal
```
### 4. Install PM2

```bash
   corepack enable 
   yarn global add pm2
```
### 5. Start the application using the provided PM2 configuration

```bash
  pm2 start pm2.config.js
```
### 6. Save pm2 running configuration

```bash  
   pm2 save
```

## Enabling automatically starting after system reboot

To ensure the application starts automatically after system reboot, PM2 can be configured to start at startup and it
will start the application as well. To set this up run:

```bash
   pm2 startup
```
