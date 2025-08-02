import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		projects: ["apps/*", "packages/*"],
		include: ["**/*.test.ts?(x)"],
		exclude: ["apps/manager/.d2/**/*", "apps/portal/build/**/*"],
	},
});
