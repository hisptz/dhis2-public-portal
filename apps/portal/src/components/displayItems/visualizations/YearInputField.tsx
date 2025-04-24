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

	const handleChange = (inputValue: any) => {
		const digits: number = inputValue.toString().length;

		if (digits >= 4 && inputValue <= currentYear) {
			setYear(inputValue);
			onChange(inputValue);
		}
	};

	return (
		<Box className="form-control" style={{ marginBlock: 8 }}>
			<Text fw={700} c="blue" id={`${label}-label`}>
				{label}
			</Text>
			<NumberInput
				value={year}
				max={currentYear}
				clampBehavior="strict"
				onChange={handleChange}
			/>
		</Box>
	);
}
