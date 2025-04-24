import React, { useEffect, useState } from "react";
import { Box, MultiSelect, Select, Text } from "@mantine/core";

export function SelectInputField({
	label,
	multiple = false,
	options,
	onChange,
	disabled = false,
	value,
}: {
	value?: string | string[];
	label: string;
	multiple?: boolean;
	options: { value: string; label: string }[] | [];
	onChange: (val: any) => void;
	disabled?: boolean;
}) {
	const [selectedOptions, setSelectedOptions] = useState<any | []>(
		value ?? [],
	);

	useEffect(() => {
		if (multiple) {
			const periods = selectedOptions.map((selectedOption: string) => {
				const option = JSON.parse(selectedOption);
				return option.value;
			});
			onChange(periods);
		} else {
			onChange(selectedOptions);
		}
	}, [multiple, onChange, selectedOptions]);

	const handleChange = (value: string | string[] | null) => {
		if (value) {
			setSelectedOptions(value);
		}
	};

	// Transform options for Mantine Select/MultiSelect
	const transformedOptions = options.map((option) => ({
		value: multiple ? JSON.stringify(option) : option.value,
		label: option.label,
	}));

	if (multiple) {
		return (
			<Box className="form-control" style={{ marginBlock: 8 }}>
				<Text fw={700} c="blue" id={`${label}-label`}>
					{label}
				</Text>
				<MultiSelect
					data={transformedOptions}
					value={selectedOptions}
					onChange={handleChange}
					disabled={disabled}
					size="md"
					checkIconPosition="left"
					clearable
					searchable
				/>
			</Box>
		);
	}

	return (
		<Box className="form-control" style={{ marginBlock: 8 }}>
			<Text fw={700} c="blue" id={`${label}-label`}>
				{label}
			</Text>
			<Select
				data={transformedOptions}
				value={selectedOptions}
				onChange={handleChange}
				disabled={disabled}
				size="sm"
				clearable
				searchable
			/>
		</Box>
	);
}
