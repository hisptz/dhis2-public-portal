import React, { useState } from "react";
import { Box, NumberInput, Text } from "@mantine/core";

export function YearInputField({
	onChange,
	label,
}: {
	onChange: (val: number) => void;
	label: string;
}) {
	const currentYear = new Date().getFullYear();
	const [year, setYear] = useState<number>(currentYear);

	const handleChange = (event: any) => {
		const newValue = event.toString();

		if (newValue.length === 0) return;

		if (/^\d*$/.test(newValue)) {
			let numericValue: number;

			if (newValue.length < 4) {
				numericValue = currentYear;
			} else {
				numericValue = Number(newValue);
			}

			const displayValue = Number(newValue);
			if (displayValue <= currentYear) {
				setYear(displayValue);
				onChange(numericValue);
			}
		}
	};

	const handleBlur = () => {
		if (year.toString().length === 0) {
			setYear(currentYear);
		}
	};

	return (
		<Box className="form-control" style={{ marginBlock: 4 }}>
			<Text
				fw={700}
				className="text-primary-400 pb-2"
				id={`${label}-label`}
			>
				{label}
			</Text>
			<NumberInput
				value={year}
				onChange={handleChange}
				onBlur={handleBlur}
			/>
		</Box>
	);
}
