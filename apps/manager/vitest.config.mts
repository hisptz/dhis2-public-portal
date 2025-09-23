import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["**/*.test.ts?(x)"],
		exclude: [".d2/*", "node_modules/*"],
	},
});
