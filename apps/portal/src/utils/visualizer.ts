import { snakeCase } from "lodash";
import { MapConfig } from "@packages/shared/schemas";

export function getMapPeriods(mapConfig: MapConfig["mapViews"][number]) {
	const periods = mapConfig.periods.map(({ id }: { id: string }) => id);
	const relativePeriods = Object.keys(mapConfig.relativePeriods ?? {}).filter(
		(key) => mapConfig.relativePeriods[key],
	);
	return [
		...periods,
		...relativePeriods.map((period) => snakeCase(period).toUpperCase()),
	];
}
