import React, { useState } from "react";
import { Box, Stack, TextInput } from "@mantine/core";

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
		const newValue = event.target.value;

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
		<Stack
			className="form-control"
			style={{ marginInlineStart: 8, marginBlock: 4 }}
			gap="sm"
		>
			<strong className="text-primary-400 pb-2" id={`${label}-label`}>
				{label}
			</strong>
			<Box>
				<TextInput
					value={year}
					onChange={handleChange}
					onBlur={handleBlur}
					variant="outlined"
					size="small"
					type="number"
				/>
			</Box>
		</Stack>
	);
}
