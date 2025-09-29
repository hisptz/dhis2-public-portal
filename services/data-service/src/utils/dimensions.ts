// @ts-ignore
import {
	createFixedPeriodFromPeriodId,
	generateFixedPeriods,
} from "@dhis2/multi-calendar-dates";
import { DateTime, Interval } from "luxon";
import {
	DataServiceDataSourceItemsConfig,
	DataServiceRuntimeConfig,
} from "@packages/shared/schemas"; // @ts-ignore
import {
	FixedPeriod,
	PeriodType,
} from "@dhis2/multi-calendar-dates/build/types/period-calculation/types";
import { Dimensions } from "@/schemas/metadata";
import logger from "@/logging";

export function getDimensions({
	runtimeConfig,
	mappingConfig: config,
	periodId,
}: {
	runtimeConfig: DataServiceRuntimeConfig;
	mappingConfig: DataServiceDataSourceItemsConfig;
	periodId: string;
}): Dimensions {
	try {
		const periodType = config.periodTypeId;
		const orgUnitLevel =
			runtimeConfig.overrides?.orgUnitLevelId ?? config.orgUnitLevel;
		const parentOrgUnit =
			runtimeConfig.overrides?.parentOrgUnitId ?? config.parentOrgUnitId;
		const period = createFixedPeriodFromPeriodId({
			periodId,
			calendar: "iso8601",
		});
		const periodInterval = Interval.fromDateTimes(
			DateTime.fromJSDate(new Date(period.startDate)),
			DateTime.fromJSDate(new Date(period.endDate)),
		);
		const periods = generateFixedPeriods({
			periodType: periodType as PeriodType,
			year: new Date(period.startDate).getFullYear(),
			calendar: "iso8601",
		})
			.filter((period: FixedPeriod) => {
				const interval = Interval.fromDateTimes(
					DateTime.fromJSDate(new Date(period.startDate)),
					DateTime.fromJSDate(new Date(period.endDate)),
				);
				return periodInterval.engulfs(interval);
			})
			.map(({ id }: { id: string }) => id);

		logger.info(`Periods: ${periods}`);

		return {
			pe: periods,
			dx: config.dataItems.map(({ sourceId }) => sourceId),
			ou: [parentOrgUnit, `LEVEL-${orgUnitLevel}`],
		};
	} catch (e) {
		if (e instanceof Error) {
			logger.error(
				`Could not get dimensions for ${config.id}: ${e.message}`,
			);
		}
		throw e;
	}
}
