---
sidebar_position: 2
---

# Deploying to Vercel

Vercel is a cloud platform for static sites and Serverless Functions that's optimized for Next.js applications. This guide will walk you through deploying the DHIS2 Public Portal to Vercel.


## Quick Deploy
For quick deploy to vercel, you can use the button below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hisptz/dhis2-public-portal&env=DHIS2_BASE_URL,DHIS2_BASE_PAT_TOKEN&envDescription=The%20DHIS2%20base%20URL%20and%20PAT%20token%20variables%20enable%20you%20to%20connect%20your%20deployed%20portal%20to%20a%20DHIS2%20instance&project-name=dhis2-public-portal&repository-name=dhis2-public-portal&root-directory=apps/portal&install-command=yarn%20install&build-command=turbo%20build%20--filter%20portal&skip-unaffected=true)

This requires you to have a [vercel](https://vercel.com/) account.
## Prerequisites

Before you begin, ensure you have the following:

- A [Vercel account](https://vercel.com/signup)
- A GitHub, GitLab, or Bitbucket account (for connecting your repository)
- Access to a DHIS2 instance

## Deployment Steps

### Option 1: Deploy from GitHub Repository

1. **Fork or Clone the Repository**

   Fork the [DHIS2 Public Portal repository](https://github.com/hisptz/dhis2-public-portal) to your GitHub account.

2. **Connect to Vercel**

   a. Log in to your Vercel account

   b. Click "Add New..." and select "Project"

   c. Import your forked repository

   d. Configure the project:
      - Framework Preset: Next.js
      - Root Directory: apps/portal
      - Build Command: yarn build
      - Output Directory: .next

   e. Add Environment Variables:
      - DHIS2_BASE_URL: URL of your DHIS2 instance
      - Add any other required environment variables

   f. Click "Deploy"

3. **Verify Deployment**

   Once the deployment is complete, Vercel will provide you with a URL to access your application.

### Option 2: Deploy Using Vercel CLI

1. **Install Vercel CLI**

   ```bash
   npm install -g vercel
   ```

2. **Clone the Repository**

   ```bash
   git clone --single-branch --branch main https://github.com/hisptz/dhis2-public-portal.git
   cd dhis2-public-portal
   ```

3. **Login to Vercel**

   ```bash
   vercel login
   ```

4. **Deploy**

   ```bash
   cd apps/portal
   vercel
   ```

   Follow the prompts to configure your deployment.

## Environment Variables

Configure the following environment variables in your Vercel project settings:

| Variable             | Description                                              | Default | Required |
|----------------------|----------------------------------------------------------|---------|----------|
| DHIS2_BASE_URL       | URL of your DHIS2 instance                               | -       | Yes      |
| DHIS2_BASE_PAT_TOKEN | DHIS2 PAT for authenticating your DHIS2 instance         | -       | Yes      |

## Custom Domains

To use a custom domain with your Vercel deployment:

1. Go to your project in the Vercel dashboard
2. Navigate to "Settings" > "Domains"
3. Add your custom domain and follow the verification steps

## Continuous Deployment

Vercel automatically sets up continuous deployment from your connected repository. When you push changes to your repository, Vercel will automatically build and deploy the updated application.

## Troubleshooting

If you encounter issues with your Vercel deployment:

1. **Build Errors**

   Check the build logs in the Vercel dashboard for specific error messages.

2. **Runtime Errors**

   Use the Vercel logs feature to view runtime logs and identify issues.

3. **CORS Issues**

   Ensure your DHIS2 instance allows requests from your Vercel domain.

4. **Environment Variables**

   Verify that all required environment variables are correctly set in the Vercel project settings.

## Limitations

When deploying to Vercel, be aware of the following limitations:

- Vercel has usage limits on the free tier
- Serverless functions have execution time limits
- Some features might require a paid Vercel plan for production use

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/solutions/nextjs)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
