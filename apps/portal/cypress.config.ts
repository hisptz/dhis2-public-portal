import { defineConfig } from "cypress";

export default defineConfig({
	e2e: {
		setupNodeEvents(on, config) {
			// implement node event listeners here
		},
		baseUrl: "http://localhost:3000",
		specPattern: "cypress/integration/**/*.cy.ts",
		viewportWidth: 1280,
		viewportHeight: 800,
		defaultCommandTimeout: 15000,
		testIsolation: false,
	},
});
