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

This leaves researchers, media, civil society, development partners, and even some ministry departments struggling to engage with the very data that’s meant to drive progress.


## Deployment

### Portal Manager

The portal manager is a DHIS2 custom application. You can install it through the App Hub or download it from the [releases](https://github.com/hisptz/dhis2-public-portal/releases) page and manually install it in your DHIS2 instance



### Portal 
There are several ways we support deploying your portal application

#### Vercel
You can quickly deploy the application through vercel by clicking the button below.
This requires you to have a [vercel](https://vercel.com/) account. 

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/hisptz/dhis2-public-portal&env=DHIS2_BASE_URL,DHIS2_BASE_PAT_TOKEN&envDescription=The%20DHIS2%20base%20URL%20and%20PAT%20token%20variables%20enable%20you%20to%20connect%20your%20deployed%20portal%20to%20a%20DHIS2%20instance&project-name=dhis2-public-portal&repository-name=dhis2-public-portal&root-directory=apps/portal&install-command=yarn%20install&build-command=turbo%20build%20--filter%20portal&skip-unaffected=true)

#### Docker
You can the portal app in docker by using docker.

```bash

docker run example will be shown here

```

You can also use `docker compose` with this docker-compose.yml file

