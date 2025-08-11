import express from "express";
import https from "https";
import { dhis2routes } from "./routes/sourceRoutes";
import { serviceStatusRouter } from "./routes/status";
import { serviceRouter } from "./routes/services";
import { env } from "@/env";
import * as fs from "node:fs";
import { connectRabbit } from "./rabbit/publisher";
import { startDownloadWorker } from "./rabbit/download.worker";
import { startUploadWorker } from "./rabbit/upload.worker";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
	res.send("Hello World!");
});
app.use("/routes", dhis2routes);
app.use("/status", serviceStatusRouter);
app.use("/services", serviceRouter);



if (env.SERVE_HTTP === "true") {
	connectRabbit().then(()=>app.listen(env.DATA_SERVICE_PORT, () => {
		console.log(
			`DHIS2 Data service is running and listening on http://localhost:${env.DATA_SERVICE_PORT}`,
		);
	})).catch((err) => {
		console.error("Failed to connect to RabbitMQ:", err);
	});
} else {
	const options = {
		key: fs.readFileSync(`./localhost-key.pem`),
		cert: fs.readFileSync(`./localhost.pem`),
	};
	connectRabbit().then(()=>
		https
		.createServer(options, app)
		.listen(env.DATA_SERVICE_PORT, () => {
			console.info(
				`DHIS2 Data service is running and listening on https://localhost:${env.DATA_SERVICE_PORT}`,
			);
		})
		.on("error", (err) => {
			console.error(err);
		})
	).catch((err) => {
		console.error("Failed to connect to RabbitMQ:", err);
	});
}