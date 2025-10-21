import express from "express";
import https from "https";
import { dhis2routes } from "./routes/sourceRoutes";
import { serviceStatusRouter } from "./routes/status";
import { serviceRouter } from "./routes/services";
import { env } from "@/env";
import * as fs from "node:fs";
import { initialize } from 'express-openapi';
import { apiDoc } from "./openapi";
import path, { dirname } from "path";
import swagger from "swagger-ui-express";
import { fileURLToPath } from "url";
import { startWorker } from "./rabbit/worker";


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

initialize({
	app,
	apiDoc: apiDoc,
	paths: path.resolve(__dirname, "./routes"),
	exposeApiDocs: (process.env.NODE_ENV !== "production"),
	validateApiDoc: false,
	routesGlob: "**/*.{ts,js}",
	routesIndexFileRegExp: /(?:index)?\.[tj]s$/,
	docsPath: `/openapi`,
}).then(() => {

	app.get("/", (req, res) => {
		res.send("Hello, Welcome to the DHIS2 Flexiportal Data Service!, Navigate to /docs to view documentation on usage and endpoints");
	});
	app.use("/routes", dhis2routes);
	app.use("/status", serviceStatusRouter);
	app.use("/services", serviceRouter);

	app.use(
		`/docs`,
		swagger.serve,
		swagger.setup(
			{},
			{
				swaggerOptions: {
					url: `/openapi`,
				},
			},
		),
	);
	if (env.SERVE_HTTP === "true") {
		startWorker()
			.then(async () => {
				try {
					console.log("Worker started successfully");
				} catch (error) {
					console.warn("⚠️ Worker startup failed, but service will continue:", error);
				}
				app.listen(env.DATA_SERVICE_PORT, () => {
					console.log(
						`DHIS2 Data service is running and listening on http://localhost:${env.DATA_SERVICE_PORT}`,
					);
				});
			})
			.catch((err) => {
				console.error("Failed to connect to RabbitMQ:", err);
			});
	} else {
		const options = {
			key: fs.readFileSync(`./localhost-key.pem`),
			cert: fs.readFileSync(`./localhost.pem`),
		};
		startWorker()
			.then(async () => {
				try {
					console.log("Worker started successfully");
				} catch (error) {
					console.warn("⚠️ Worker startup failed, but service will continue:", error);
				}

				https
					.createServer(options, app)
					.listen(env.DATA_SERVICE_PORT, () => {
						console.info(
							`DHIS2 Data service is running and listening on https://localhost:${env.DATA_SERVICE_PORT}`,
						);
					})
					.on("error", (err) => {
						console.error(err);
					});
			})
			.catch((err) => {
				console.error("Failed to connect to RabbitMQ:", err);
			});
	}

});

