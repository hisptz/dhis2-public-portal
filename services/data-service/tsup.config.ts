import { defineConfig } from "tsup";

export default defineConfig({
	entry: ["src/app.ts"],
	minify: true,
	format: ["esm"],
	splitting: false,
	outDir: "app",
	sourcemap: false,
	clean: true,
	platform: "node",
	target: "esnext",
	noExternal: [/(.*)/],
});
