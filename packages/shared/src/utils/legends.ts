import { LegendSet } from "@hisptz/dhis2-utils";

export function getLegendColorFromValue({
	legendSet,
	value,
}: {
	legendSet?: LegendSet;
	value?: number;
}): string | null {
	if (!legendSet && !value) {
		return null;
	}
	const legends = legendSet?.legends ?? [];
	const legend = legends.find((l) => {
		return (
			l.startValue === value ||
			l.endValue === value ||
			(l.startValue < value! && value! < l.endValue)
		);
	});
	return legend?.color ?? null;
}
