---
sidebar_position: 8
---

# Data Service Configuration

The Data Service Configuration enables automated data and metadata migration between DHIS2 instances. This powerful feature allows you to sync data, metadata, dashboards, visualizations, and maps from a source DHIS2 instance to your destination instance.

## Overview

The data service operates as a background worker that processes migration tasks through RabbitMQ queues. It supports:

- **Metadata Migration**: Download and upload dashboards, visualizations, maps, and related metadata
- **Data Migration**: Transfer aggregate data, analytics tables data
- **Data Deletion**: Clean up data from destination instances
- **Queue Management**: Monitor and retry failed operations
- **Data Validation**: Compare data between source and destination instances to identify discrepancies

## Prerequisites

Before setting up data service configurations, ensure you have:

1. **Data Service**: A running instance of the Data Service with RabbitMQ
2. **Access Credentials**: Valid DHIS2 credentials for both source and destination instances
3. **Router Configuration**: Data service route configured in the destination instance's router manager

## Initial Setup

### Step 1: Configure Router Manager

Before creating any data configurations, you must set up a data service route in the router manager of your destination DHIS2 instance:

1. **Access Router Manager**: Log in to your destination DHIS2 instance and navigate to the Router Manager app
2. **Create New Route**:
    - **Code**: Set to `data-service`
    - **URL**: Set to your data service URL
        - **Production**: Use your actual data service URL (e.g., `https://data-service.yourdomain.com`)
        - **Development**: Use tunnel URL or port forwarding (e.g., `https://tunnel-url.ngrok.io` or
          `http://localhost:****`)

:::warning Important

The route code must be exactly `data-service` for the system to properly connect to your data service instance.

:::

### Step 2: Verify Data Service Connection

Ensure your data service is running and accessible:

- Check that RabbitMQ is running and configured
- Verify the data service can connect to both source and destination DHIS2 instances
- Test the router configuration by accessing the data service through the configured route

## Creating Data Configurations

### Accessing Configuration Management

1. Log in to the Manager App
2. Navigate to "Data service configuration" in the sidebar menu
3. Click "Add data configuration" button

## Migration Operations

### Metadata Migration

#### Download Metadata

Metadata download fetches dashboards, visualizations, maps and their dependencies from the source instance:

1. **Select Configuration**: Choose your data configuration
2. **Navigate to Metadata**: Go to Actions and click Run migration
3. **Service type**:
    - Choose metadata migration (source instance or FlexiPortal config)
    - Select specific items or use bulk selection
4. **Initiate Download**: Click "Run"

The system will queue the download request and process it in the background.

### Data Migration

#### Download Data

Data download transfers aggregate data from the source:

1. After metadata migration open the configuration the click "Add data item"
2. **Configure Data items**:
    - Select type and name of your data item configuration
    - Select period type
    - Choose organisation unit and organisation unit level
   - Select data items that were downloaded from source
3. Create and save your data item configurations
4. **Initiate Download**:
    - Afterwards head back and run migration
    - Service type as "Data Migration"
    - Select period type and periods
    - select configuration items
    - Click "run"
5. **Monitor Queues**: Track progress through queue monitoring

### Data Deletion

Remove data from the destination instance based on specified criteria:

1. **Configure Deletion Parameters**:
    - Select Period type and periods
    - Select configuration items to be deleted
2. **Safety Check**: Review deletion criteria carefully
3. **Execute Deletion**: Start the deletion process

:::danger Warning

Data deletion is irreversible. Always verify your deletion criteria and test in a non-production environment first.

:::

## Monitoring and Management

### Process Monitoring

The system provides real-time monitoring of migration processes:

#### Queue Status

- **Queued**: Number of pending operations
- **Processing**: Currently running operations
- **Failed**: Operations that encountered errors

#### Process Types

- **Metadata Download**: Fetching metadata from source
- **Metadata Upload**: Importing metadata to destination
- **Data Download**: Retrieving data from source
- **Data Upload**: Importing data to destination
- **Data Deletion**: Removing data from destination

#### Managing Failed Operations

When operations fail:

1. **View Failed Messages**: Click on failed count to see detailed errors
2. **Analyze Failures**: Review error messages and failure reasons
3. **Retry Operations**:
    - Retry individual failed messages
    - Retry all failed operations

#### Clearing Queues

When necessary, you can clear queue contents:

- Clear specific queue types
- Clear all failed messages

:::warning Queue Management

Clearing queues will permanently remove pending operations. Ensure this is the intended action before proceeding.

:::

### Data Validation

The data validation provide data comparison and verification between source and destination instances. This feature helps identify discrepancies and ensures data integrity after migration operations.

#### Accessing Data Validation

1. Navigate to your configuration
2. Click on Run migration then service type "Data Validation"
3. Select the configurations you would like to compare then click "Run"
4. Review the comparison results in a tabular format

#### Data Validation Features

**Comparison Analysis**: The data validation system compares data between source and destination instances and presents results in an organized table format.

#### Discrepancy Detection

The data validation table highlights discrepancies such as:

- **Missing Items**: Items present in source but absent in destination
- **Value Differences**: Data values that don't match between instances
