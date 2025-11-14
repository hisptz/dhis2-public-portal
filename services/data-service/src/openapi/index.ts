import dotenv from "dotenv";

dotenv.config();

const port = process.env.DATA_SERVICE_PORT || "3000";
const baseURL = `http://localhost:${port}`;

export const apiDoc: any = {
	openapi: "3.0.0",
	info: {
		title: "DHIS2 Data Service API",
		version: "1.0.0",
		description: "Service to transfer data from source DHIS2 instances to the Destination DHIS2 instance."
	},
	servers: [
		{
			url: `http://localhost:${port}`,
			description: "Development server"
		}
	],
	paths: {}
};
