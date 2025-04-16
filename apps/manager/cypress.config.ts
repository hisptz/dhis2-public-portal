import { defineConfig } from "cypress";
import { chromeAllowXSiteCookies } from "@dhis2/cypress-plugins";

export default defineConfig({
	e2e: {
		setupNodeEvents(on, config) {
			chromeAllowXSiteCookies(on, config);
		},
		baseUrl: "http://localhost:3001",
		specPattern: "cypress/integration/**/*.cy.ts",
		viewportWidth: 1280,
		viewportHeight: 800,
		defaultCommandTimeout: 15000,
		testIsolation: false,
	},
	env: {
		networkMode: "live",
		dhis2BaseUrl: "http://localhost:8080",
		dhis2DataTestPrefix: "d2-ppm",
		dhis2InstanceVersion: 41,
	},
});
