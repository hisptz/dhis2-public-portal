import { useController, useWatch } from "react-hook-form";
import { DataServiceDataSourceItemsConfig } from "@packages/shared/schemas";
import { useDataQuery } from "@dhis2/app-runtime";
import React, { useEffect, useMemo } from "react";
import { RHFSingleSelectField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { Button, ButtonStrip, Field } from "@dhis2/ui";
import { RHFMultiSelectField } from "../../../../../../Fields/RHFMultiSelectField";

const attributeQuery = {
	attribute: {
		resource: "dimensions",
		params: {
			fields: "id,displayName~rename(name)",
			filter: [
				"dimensionType:eq:CATEGORY",
				"dataDimensionType:eq:ATTRIBUTE",
			],
			paging: false,
		},
	},
};

interface AttributeQueryResponse {
	attribute: {
		dimensions: {
			id: string;
			name: string;
		}[];
	};
}

const attributeItemsQuery: any = {
	attributeItems: {
		resource: "dimensions",
		id: ({ id }: { id: string }) => `${id}/items`,
		params: {
			fields: "id,displayName~rename(name)",
		},
	},
};

interface AttributeItemsQueryResponse {
	attributeItems: {
		items: {
			id: string;
			name: string;
		}[];
	};
}

function AttributeItemsFields() {
	const { field } = useController<
		DataServiceDataSourceItemsConfig,
		"attributeOptions"
	>({
		name: "attributeOptions",
	});
	const attributeId = useWatch<
		DataServiceDataSourceItemsConfig,
		"attributeId"
	>({
		name: "attributeId",
	});

	const { data, loading, error, refetch } =
		useDataQuery<AttributeItemsQueryResponse>(attributeItemsQuery, {
			variables: {
				id: attributeId,
			},
			lazy: true,
		});

	const options = useMemo(() => {
		return (
			data?.attributeItems?.items?.map((item) => ({
				label: item.name,
				value: item.id,
			})) ?? []
		);
	}, [data]);

	useEffect(() => {
		if (attributeId) {
			refetch({
				id: attributeId,
			});
		}
	}, [attributeId]);

	if (!attributeId) {
		return null;
	}

	return (
		<Field
			required
			helpText={
				error
					? `${i18n.t("Could not get attribute options")}:${error.message}`
					: undefined
			}
			label={i18n.t("Attribute Options")}
		>
			<div className="flex flex-col gap-2">
				<ButtonStrip>
					<Button
						onClick={() => {
							field.onChange([
								...options.map(({ value }) => value),
							]);
						}}
						small
					>
						{i18n.t("Select all")}
					</Button>
					<Button
						small
						onClick={() => {
							field.onChange([]);
						}}
					>
						{i18n.t("Clear values")}
					</Button>
				</ButtonStrip>
				<RHFMultiSelectField
					required
					disabled={!!error}
					loading={loading}
					name="attributeOptions"
					options={options}
				/>
			</div>
		</Field>
	);
}

export function AttributeFields() {
	const type = useWatch<DataServiceDataSourceItemsConfig, "type">({
		name: "type",
	});
	const { data, loading, error, refetch } =
		useDataQuery<AttributeQueryResponse>(attributeQuery, {
			lazy: true,
		});
	const options = useMemo(() => {
		return (
			data?.attribute?.dimensions?.map((item) => ({
				label: item.name,
				value: item.id,
			})) ?? []
		);
	}, [data]);

	useEffect(() => {
		if (type === "ATTRIBUTE_VALUES") {
			refetch();
		}
	}, [type]);

	if (!(type === "ATTRIBUTE_VALUES")) {
		return null;
	}

	return (
		<>
			<RHFSingleSelectField
				required
				loading={loading}
				helpText={
					error
						? `${i18n.t("Could not get attributes dimensions")}:${error.message}`
						: undefined
				}
				disabled={!!error}
				label={i18n.t("Attribute")}
				name={"attributeId"}
				options={options}
			/>
			<AttributeItemsFields />
		</>
	);
}
