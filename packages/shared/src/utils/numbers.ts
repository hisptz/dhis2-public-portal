export const numberFormatter = (value: number) =>
	Intl.NumberFormat("en-GB", {
		notation: "standard",
		maximumFractionDigits: 2,
	}).format(value);
