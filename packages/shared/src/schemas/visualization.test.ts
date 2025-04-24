import { describe, expect, it } from "vitest";
import axios from "axios";
import {
	VisualizationConfig,
	visualizationFields,
	visualizationSchema,
} from "./visualization";
import { config } from "dotenv";

describe("visualization schema", async () => {
	config();

	console.log({
		env: process.env,
	});

	const dhis2Client = axios.create({
		baseURL: process.env.VITE_DHIS2_BASE_URL,
		headers: {
			Authorization: `ApiToken ${process.env.VITE_DHIS2_BASE_PAT_TOKEN}`,
		},
	});
	console.log({
		env: process.env,
	});
	const response = await dhis2Client.get<{
		visualizations: Array<VisualizationConfig>;
	}>("api/visualizations", {
		params: {
			fields: visualizationFields.join(","),
			paging: false,
		},
	});
	const visualizations = response.data?.visualizations;

	visualizations.forEach((visualization) => {
		it("Passes the visualization schema", async () => {
			expect(() =>
				visualizationSchema.parse(visualization),
			).not.toThrowError();
		});
	});
});
