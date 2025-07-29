import { useDataQuery } from "@dhis2/app-runtime";
import { Field, Transfer } from "@dhis2/ui";
import { debounce, find, uniqBy } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Controller } from "react-hook-form";

export interface VisualizationSelectorProps {
	name: string;
	label: string;
	required?: boolean;
}

const visualizationQuery = {
	vis: {
		resource: "visualizations",
		params: ({ page, keyword }: any) => {
			return {
				fields: ["id", "displayName"],
				page,
				pageSize: 50,
				totalPages: true,
				filter: keyword ? [`identifiable:token:${keyword}`] : undefined,
			};
		},
	},
};

export function VisualizationSelector({
	name,
	label,
	required,
}: VisualizationSelectorProps) {
	const [options, setOptions] = useState<
		Array<{ label: string; value: string }>
	>([]);
	const { data, loading, refetch } = useDataQuery<{
		vis: { pager: any; visualizations: any[] };
	}>(visualizationQuery, {
		variables: {
			page: 1,
		},
	});

	useEffect(() => {
		if (data) {
			const newData: any[] = data?.vis?.visualizations?.map(
				(visualization: any) => {
					return {
						label: visualization.displayName,
						value: visualization.id,
					};
				},
			);
			setOptions((prevState) =>
				uniqBy([...prevState, ...newData], "value"),
			);
		}
	}, [data]);

	const onNextPage = useCallback(() => {
		const page = parseInt(data?.vis?.pager?.page);
		const totalPages = parseInt(data?.vis?.pager?.pageCount);
		if (page !== totalPages) {
			refetch({
				page: parseInt(data?.vis?.pager?.page??"0") + 1,
			});
		}
	}, [refetch, data]);

	const onFilter = useCallback(
		(keyword: string) => {
			return refetch({
				keyword,
				page: 1,
			});
		},
		[refetch],
	);

	const onFilterChange = debounce(async ({ value }) => {
		const { vis: visualizationResponse } = await onFilter(value);
		const visualizations =
			(visualizationResponse as any)?.visualizations ?? [];
		setOptions(
			uniqBy(
				[
					...visualizations.map((visualization: any) => ({
						label: visualization.displayName,
						value: visualization.id,
					})),
				],
				"value",
			),
		);
	}, 1000);

	return (
		<Controller
			render={({ field, fieldState }) => {
				const updatedOptions = useMemo(() => {
					return uniqBy(
						[
							...(options ?? []),
							...(field.value?.map(({ id, name }: any) => ({
								label: name,
								value: id,
							})) ?? []),
						],
						"value",
					);
				}, [options]);

				return (
					<Field
						validationText={fieldState.error?.message}
						error={!!fieldState.error}
						required={required}
						label={label}
					>
						<Transfer
							onEndReached={onNextPage}
							filterable
							loading={loading}
							options={updatedOptions}
							onFilterChange={onFilterChange}
							selected={
								field?.value?.map(
									({ id }: { id: string }) => id,
								) ?? []
							}
							onChange={({
								selected,
							}: {
								selected: string[];
							}) => {
								field.onChange(
									selected?.map((value) => ({
										id: value,
										name: find(updatedOptions, [
											"value",
											value,
										])?.label,
									})),
								);
							}}
						/>
					</Field>
				);
			}}
			name={name}
		/>
	);
}
