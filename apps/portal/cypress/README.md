# Cypress Testing with Server-Side Rendering (SSR) Support

This document explains how to use Cypress for testing the portal application, including components that rely on server-side rendering (SSR).

## Overview

The portal application uses Next.js for server-side rendering, which means that some data fetching happens on the server before the page is sent to the client. This creates challenges for traditional Cypress testing, as Cypress normally can only intercept client-side network requests.

To solve this issue, we use the `cypress-ssr-localhost-mocker` package, which allows us to mock server-side API requests during testing.

## Setup

The setup includes:

1. Installing the `cypress-ssr-localhost-mocker` package
2. Configuring Cypress to use the SSR mocker
3. Updating tests to use the SSR mocker commands

## Usage

### Mocking Server-Side API Requests

Instead of using the standard Cypress `cy.intercept()` command, use the `cy.mockNextApi()` command provided by the `cypress-ssr-localhost-mocker` package:

```typescript
// Mock a server-side API request
cy.mockNextApi("**/dataStore/**/menu", {
  statusCode: 200,
  body: menuConfig,
});
```

### Example Test

Here's an example of a test that mocks a server-side API request:

```typescript
describe("Menu Tests", () => {
  context("Header Menu", () => {
    beforeEach(() => {
      // Load the header menu fixture
      cy.fixture("menu-header.json").then((menuConfig: AppMenuConfig) => {
        // Mock the server-side API request and return our fixture
        cy.mockNextApi("**/dataStore/**/menu", {
          statusCode: 200,
          body: menuConfig,
        });

        // Visit the application
        cy.visit("/");
      });
    });

    it("should render the menu in the header", () => {
      // Test assertions here
    });
  });
});
```

## Running Tests

Use the following npm scripts to run the tests:

- `yarn test:e2e`: Run tests in headless mode
- `yarn test:e2e-open`: Open the Cypress UI for interactive testing

Both commands will start the Next.js development server and Cypress concurrently.

## Limitations

- The `cypress-ssr-localhost-mocker` package only works with localhost development servers
- It may not capture all types of server-side requests, especially those made during build time
- Complex server-side logic might require additional mocking strategies

## Troubleshooting

If you encounter issues with the SSR mocking:

1. Make sure the Next.js server is running on the expected port (default: 3000)
2. Check that the API route patterns in your mocks match the actual requests
3. Verify that the `cypress-ssr-localhost-mocker` package is properly configured in the Cypress setup
