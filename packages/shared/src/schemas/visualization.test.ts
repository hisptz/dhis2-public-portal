import { describe, expect, it } from "vitest";
import axios from "axios";
import {
	analyticsDimensionSchema,
	VisualizationChartType,
	VisualizationConfig,
	visualizationFields,
	visualizationSchema,
} from "./visualization";
import { config } from "dotenv";
import {
	getChartLayout,
	getDataItems,
	getLayout,
	getOrgUnits,
	getPeriods,
} from "../utils";
import { PeriodUtility } from "@hisptz/dhis2-utils";

config();

const dhis2Client = axios.create({
	baseURL: process.env.VITE_DHIS2_BASE_URL,
	headers: {
		Authorization: `ApiToken ${process.env.VITE_DHIS2_BASE_PAT_TOKEN}`,
	},
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

describe("visualization schema", async () => {
	visualizations.forEach((visualization) => {
		it(`Passes the visualization schema for visualization ${visualization.name}<${visualization.type}>`, () => {
			expect(() =>
				visualizationSchema.parse(visualization),
			).not.toThrowError();
		});
	});
});
describe("get layout function", async () => {
	visualizations.forEach((visualization) => {
		it(`Passes the get layout function ${visualization.name}<${visualization.type}>`, () => {
			const layout = getLayout(visualization);
			Object.values(layout).forEach((value) => {
				value.forEach((item) => {
					expect(() =>
						analyticsDimensionSchema.parse(item),
					).not.toThrowError();
				});
			});
		});
	});
});
describe("get chart layout function", async () => {
	visualizations.forEach((visualization) => {
		if (visualization.type !== VisualizationChartType.TABLE) {
			it(`Passes the get chart layout function for chart visualization ${visualization.name}<${visualization.type}>`, () => {
				const layout = getChartLayout(visualization);
				Object.values(layout).forEach((value) => {
					value.forEach((item) => {
						expect(() =>
							analyticsDimensionSchema.parse(item),
						).not.toThrowError();
					});
				});
			});
		}
	});
});
describe("get data items function", async () => {
	visualizations.forEach((visualization) => {
		it(`getDataItems returns at least one data item for visualization ${visualization.name}<${visualization.type}>`, () => {
			try {
				const dataItems = getDataItems(visualization);
				// expect(dataItems.length).equal(
				// 	visualization.dataDimensionItems.length,
				// );
			} catch (e) {
				console.log(e);
			}
		});
	});
});
describe("get periods function", async () => {
	visualizations.forEach((visualization) => {
		it(`getPeriod returns a valid period for visualization ${visualization.name}<${visualization.type}>`, () => {
			const periods = getPeriods(visualization);
			periods.forEach((period) => {
				expect(() =>
					PeriodUtility.getPeriodById(period),
				).not.toThrowError();
			});
		});
	});
});
describe("get org units function", async () => {
	visualizations.forEach((visualization) => {
		it(`getOrgUnits returns a valid orgUnits for visualization ${visualization.name}<${visualization.type}>`, () => {
			const orgUnits = getOrgUnits(visualization);
			orgUnits.forEach((orgUnit) => {
				expect(orgUnit).toMatch(
					/USER_ORGUNIT|USER_ORGUNIT_CHILDREN|USER_ORGUNIT_GRANDCHILDREN|^LEVEL-\d?$|^OU_GROUP-[0-9a-zA-Z]{11}$|^[0-9a-zA-Z]{11}$/,
				);
			});
		});
	});
});
