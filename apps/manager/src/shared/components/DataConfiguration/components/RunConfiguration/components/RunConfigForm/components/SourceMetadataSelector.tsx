import { useDataQuery } from "@dhis2/app-runtime";
import { Field, Transfer } from "@dhis2/ui";
import { debounce, find, uniqBy } from "lodash";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { DataServiceConfig } from "@packages/shared/schemas";

export interface SourceMetadataSelectorProps {
	name: string;
	label: string;
	required?: boolean;
	config: DataServiceConfig;
	resourceType: "visualizations" | "maps" | "dashboards";
}

const createMetadataQuery = (resourceType: string, routeId: string) => ({
	metadata: {
		resource: `routes/${routeId}/run/${resourceType}`,
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
});

export function SourceMetadataSelector({
	name,
	label,
	required,
	config,
	resourceType,
}: SourceMetadataSelectorProps) {
	const [options, setOptions] = useState<
		Array<{ label: string; value: string }>
	>([]);
	const { data, loading, refetch } = useDataQuery<{
		metadata: { pager: any; [key: string]: any };
	}>(createMetadataQuery(resourceType, config.source.routeId), {
		variables: {
			page: 1,
		},
	});

	useEffect(() => {
		if (data) {
			const items = data?.metadata?.[resourceType] || [];
			const newData: any[] = items?.map((item: any) => {
				return {
					label: item.displayName,
					value: item.id,
				};
			});
			setOptions((prevState) =>
				uniqBy([...prevState, ...newData], "value"),
			);
		}
	}, [data, resourceType]);

	const onNextPage = useCallback(() => {
		const page = parseInt(data?.metadata?.pager?.page);
		const totalPages = parseInt(data?.metadata?.pager?.pageCount);
		if (page !== totalPages) {
			refetch({
				page: parseInt(data?.metadata?.pager?.page ?? "0") + 1,
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
		const { metadata: metadataResponse } = await onFilter(value);
		const items = (metadataResponse as any)?.[resourceType] ?? [];
		setOptions(
			uniqBy(
				[
					...items.map((item: any) => ({
						label: item.displayName,
						value: item.id,
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
				}, [options, field.value]);

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
