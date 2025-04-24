import React, { useState } from "react";
import { Box, NumberInput } from "@mantine/core";

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
			<NumberInput
				value={year}
				label={label}
				max={currentYear}
				clampBehavior="strict"
				onChange={handleChange}
			/>
		</Box>
	);
}
