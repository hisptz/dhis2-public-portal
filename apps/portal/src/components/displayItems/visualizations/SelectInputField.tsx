import React, { useEffect, useMemo, useState } from "react";
import { Box, MultiSelect, Select } from "@mantine/core";

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
	const extractValues = (val: string | string[]) => {
		if (Array.isArray(val)) {
			return val.map((v) => {
				try {
					return JSON.parse(v)?.value || v;
				} catch {
					return v;
				}
			});
		}
		try {
			return JSON.parse(val)?.value || val;
		} catch {
			return val;
		}
	};

	const [selectedOptions, setSelectedOptions] = useState<string | string[]>(
		extractValues(value ?? (multiple ? [] : "")),
	);

	const [labelMap, setLabelMap] = useState<Record<string, string>>({});

	useEffect(() => {
		const map: Record<string, string> = {};
		options.forEach((opt) => {
			map[opt.value] = opt.label;
		});
		if (Array.isArray(value)) {
			value.forEach((val) => {
				const opt = JSON.parse(val);
				map[opt.value] = opt.label;
			});
		}
		setLabelMap((prev) => ({ ...prev, ...map }));
	}, [options]);

	useEffect(() => {
		onChange(selectedOptions);
	}, [onChange, selectedOptions]);

	const handleChange = (value: string | string[] | null) => {
		if (value !== null) {
			setSelectedOptions(value);
		}
	};

	const displayOptions = useMemo(() => {
		const optionMap = Object.fromEntries(options.map((o) => [o.value, o]));
		const values = Array.isArray(selectedOptions)
			? selectedOptions
			: [selectedOptions];

		const missingSelected = values
			.filter((val) => !optionMap[val])
			.map((val) => ({
				value: val,
				label: labelMap[val] ?? val,
			}));

		return [...options, ...missingSelected];
	}, [options, selectedOptions, labelMap]);

	if (multiple) {
		return (
			<Box className="form-control" style={{ marginBlock: 8 }}>
				<MultiSelect
					mt="md"
					label={label}
					data={displayOptions}
					value={selectedOptions as string[]}
					onChange={handleChange}
					disabled={disabled}
					size="sm"
					checkIconPosition="left"
					clearable
					searchable
				/>
			</Box>
		);
	}

	return (
		<Box className="form-control" style={{ marginBlock: 8 }}>
			<Select
				label={label}
				data={displayOptions}
				value={selectedOptions as string}
				onChange={handleChange}
				disabled={disabled}
				size="sm"
				clearable
				searchable
			/>
		</Box>
	);
}
