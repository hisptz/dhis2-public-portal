"use client";

import { Stack, MenuItem, Select } from "@mantine/core";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export interface SelectComponentProps {
	label: string;
	options: {
		label: string;
		value: string;
		children?:
			| Array<{
					key: string;
					ids: string | string[];
			  }>
			| {
					key: string;
					ids: string | string[];
			  };
	}[];
	value?: string;
	paramKey: string;
}

export function SingleSelector({
	label,
	options,
	value,
	paramKey,
}: SelectComponentProps) {
	const searchParams = useSearchParams();

	return (
		<Stack className="form-control">
			<strong className="text-primary-400 pb-2" id={`${label}-label`}>
				{label}
			</strong>
			<Select id={`${label}-select`} value={value}>
				{options.map((item) => {
					const link = new URLSearchParams(searchParams);
					link.set(paramKey, item.value);

					if (item.children) {
						if (Array.isArray(item.children)) {
							for (const child of item.children) {
								link.set(
									child.key,
									Array.isArray(child.ids)
										? child.ids.join(",")
										: child.ids,
								);
							}
						} else {
							const child = item.children;
							link.set(
								child.key,
								Array.isArray(child.ids)
									? child.ids.join(",")
									: child.ids,
							);
						}
					}

					return (
						// @ts-ignore
						<MenuItem
							href={`?${link.toString()}`}
							component={Link}
							key={item.label}
						>
							{item.label}
						</MenuItem>
					);
				})}
			</Select>
		</Stack>
	);
}
