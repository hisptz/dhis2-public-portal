"use client";

import { animated, useSpring } from "react-spring";

const numberFormatter = (value: number) =>
	Intl.NumberFormat("en-GB", {
		notation: "compact",
		maximumFractionDigits: 2,
	}).format(value);

export function SurveyDataValue({ value }: { value: number }) {
	const sanitizedValue = useSpring({
		cancel: false,
		val: value,
		from: { val: 0 },
		config: {
			duration: 3000,
		},
		delay: 10,
	});

	return (
		<b className="text-secondary-900 text-5xl">
			{/*@ts-ignore*/}
			<animated.div>
				{sanitizedValue.val.to((value) => numberFormatter(value))}
			</animated.div>
		</b>
	);
}
