import { Glob } from "bun";
import { copyFile } from "node:fs/promises";

const outDir = "app";

export {};

const glob = new Glob("./src/routes/**/*.ts");

// Scan the current working directory for files that match the pattern
const entrypoints = await Array.fromAsync(glob.scan({ cwd: process.cwd() }));

await Bun.build({
	entrypoints: ["./src/app.ts", "./src/rabbit/worker.ts", ...entrypoints],
	root: "./src",
	outdir: outDir,
	format: "esm",
	target: "bun",
	sourcemap: "inline",
	minify: true,
	splitting: true,
});

await copyFile("package.prod.json", `${outDir}/package.json`);
