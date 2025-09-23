import path from "path";
import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";

const viteConfig = defineConfig(async (configEnv) => {
	const { mode } = configEnv;
	return {
		plugins: [
			tanstackRouter({
				target: "react",
				autoCodeSplitting: true,
			}),
			tailwindcss(),
		],
		// In dev environments, don't clear the terminal after files update
		clearScreen: mode !== "development",
		// Use an import alias: import from '@/' anywhere instead of 'src/'
		resolve: { alias: { "@": path.resolve(__dirname, "src") } },
		// ...other config options here
	};
});

export default viteConfig;
