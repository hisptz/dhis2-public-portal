import { defineConfig } from "cypress";
import coverageConfigTask from "@cypress/code-coverage/task";

export default defineConfig({
	e2e: {
		setupNodeEvents(on, config) {
			coverageConfigTask(on, config);
			// on("before:spec", () => {
			// 	return SSRLocalhostMocker.init(8080); // it'll initialize your servers. You can pass any ports you want on params, like: (3000, 3001, 3002, ...)
			// });
			// on("after:spec", () => {
			// 	return SSRLocalhostMocker.close(); // it'll close server when necessary
			// });
			// on("task", {
			// 	mockBackendRequest: SSRLocalhostMocker.getMockBackendRequest(), // it'll create a helper to mock requests
			// 	clearAllbackendMockRequests:
			// 		SSRLocalhostMocker.getClearAllMocks(), // it'll create a helper to clear mock requests
			// });
			return config;
		},
		baseUrl: "http://localhost:3000",
		specPattern: "cypress/integration/**/*.cy.ts",
		viewportWidth: 1280,
		viewportHeight: 800,
		defaultCommandTimeout: 15000,
		testIsolation: false,
	},
});
