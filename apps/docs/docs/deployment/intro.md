---
sidebar_position: 1
---

# Introduction

This section provides comprehensive documentation on how to deploy the DHIS2 FlexiPortal and Portal Manager applications in various environments.

## Overview

The DHIS2 FlexiPortal project consists of two main applications:

1. **Portal** - The public-facing web application that displays DHIS2 data to users
2. **Portal Manager** - The administrative application used to configure and manage the Portal

Each application has different deployment requirements and options, which are detailed in their respective sections.

## Deployment Options

### Portal Deployment
The Portal application can be deployed using several methods:
- Docker (recommended for production)
- Vercel or other Next.js-compatible hosting services
- Custom deployment on non-root paths

### Portal Manager Deployment
The Portal Manager application can be deployed directly to a DHIS2 instance as a standard DHIS2 app:
 - Manually from github releases
 - Through the app hub

Choose the deployment method that best fits your infrastructure and requirements.
