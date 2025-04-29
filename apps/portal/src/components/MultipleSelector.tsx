"use client";

import { useCallback } from "react";
import { Box, MultiSelect, Text } from "@mantine/core";

export interface MultiSelectProps {
	label: string;
	options: { label: string; value: string }[];
	value: string[];

	onChange(value: string[]): void;
}

export function MultipleSelector({
	label,
	options,
	onChange,
	value,
}: MultiSelectProps) {
	const handleChange = useCallback(
		(selectedValues: string[]) => {
			onChange(selectedValues);
		},
		[onChange],
	);

	// Transform options for Mantine MultiSelect
	const transformedOptions = options.map((option) => ({
		value: option.value,
		label: option.label,
	}));

	return (
		<Box className="form-control" style={{ margin: 8 }}>
			<Text
				fw={700}
				className="text-primary-400 pb-2"
				id={`${label}-label`}
			>
				{label}
			</Text>
			<MultiSelect
				data={transformedOptions}
				value={value}
				onChange={handleChange}
				id={label}
				size="sm"
				checkIconPosition="right"
				clearable
				searchable
			/>
		</Box>
	);
}
