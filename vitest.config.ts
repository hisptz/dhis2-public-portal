import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		include: ["test/**/*.test.ts?(x)"],
		exclude: ["**/node_modules/**", "**/.d2/**"],
	},
});
