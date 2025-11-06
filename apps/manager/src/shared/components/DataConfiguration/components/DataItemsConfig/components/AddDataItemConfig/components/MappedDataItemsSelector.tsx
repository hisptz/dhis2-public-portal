import React, { useEffect, useMemo, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { Field, CircularLoader, MultiSelectField, MultiSelectOption, NoticeBox } from "@dhis2/ui";
import { useDataQuery } from "@dhis2/app-runtime";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { DataServiceDataSourceItemsConfig } from "@packages/shared/schemas";
import i18n from "@dhis2/d2-i18n";

const mappedDataItemsQuery = {
    mappings: {
        resource: `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}`,
        id: ({ configId }: { configId: string }) => configId,
        params: {
            fields: "dataItems,itemsConfig",
        },
    },
};

interface MappedDataItemsSelectorProps {
    configId: string;
    name: string;
    label: string;
    required?: boolean;
    helpText?: string;
}

export function MappedDataItemsSelector({
    configId,
    name,
    label,
    required,
    helpText,
}: MappedDataItemsSelectorProps) {
    const { control } = useFormContext<DataServiceDataSourceItemsConfig>();

    const {
        field: { value, onChange },
        fieldState: { error },
    } = useController({
        name: name as any,
        control,
        rules: { required: required ? i18n.t("At least one data item is required") : false },
    });

    const { data, loading, error: queryError } = useDataQuery<{
        mappings: {
            dataItems?: Array<{
                id: string;
                sourceId: string;
            }>;
            itemsConfig?: Array<{
                id: string;
                name: string;
                dataItems: Array<{
                    id: string;
                    sourceId: string;
                }>;
            }>;
        };
    }>(mappedDataItemsQuery, {
        variables: { configId },
    });

    const options = useMemo(() => {
        let allDataItems: Array<{ id: string; sourceId: string }> = [];

        if (data?.mappings?.dataItems) {
            allDataItems = [...allDataItems, ...data.mappings.dataItems];
        }

        if (data?.mappings?.itemsConfig) {
            const itemsConfigDataItems = data.mappings.itemsConfig
                .flatMap(config => config.dataItems || []);
            allDataItems = [...allDataItems, ...itemsConfigDataItems];
        }

        const uniqueDataItems = allDataItems.reduce((acc, item) => {
            if (!acc.find(existing => existing.id === item.id)) {
                acc.push(item);
            }
            return acc;
        }, [] as Array<{ id: string; sourceId: string }>);

        return uniqueDataItems.map(item => ({
            label: `${item.sourceId} → ${item.id}`,
            value: item.id,
            sourceId: item.sourceId,
        }));
    }, [data]);

    const handleSelectionChange = (selectedIds: string[]) => {
        const selectedItems = selectedIds.map(id => {
            let mappedItem: { id: string; sourceId: string } | undefined;

            if (data?.mappings?.dataItems) {
                mappedItem = data.mappings.dataItems.find(item => item.id === id);
            }

            if (!mappedItem && data?.mappings?.itemsConfig) {
                const allItemsConfigDataItems = data.mappings.itemsConfig
                    .flatMap(config => config.dataItems || []);
                mappedItem = allItemsConfigDataItems.find(item => item.id === id);
            }

            return {
                id,
                sourceId: mappedItem?.sourceId || id,
            };
        });
        onChange(selectedItems);
    };

    const selectedValues = useMemo(() => {
        if (!Array.isArray(value)) return [];
        return value.map(item => item.id);
    }, [value]);

    if (loading) {
        return (
            <Field label={label}>
                <div className="flex items-center gap-2">
                    <CircularLoader small />
                    <span>{i18n.t("Loading mapped data items...")}</span>
                </div>
            </Field>
        );
    }

	if (queryError) {
		return (
			<div className="flex flex-col gap-4">
				<Field label={label} required={required}>
					<div />
				</Field>
				<NoticeBox
					error
					title={i18n.t("Failed to Load Mapped Data Items")}
				>
					{i18n.t("There was an error loading the pre-mapped data items. Please ensure that metadata migration has been completed successfully and that the configuration exists in the datastore.")}
				</NoticeBox>
			</div>
		);
	}	if (!options.length) {
		return (
			<div className="flex flex-col gap-4">
				<Field label={label} required={required}>
					<div />
				</Field>
				<NoticeBox
					warning
					title={i18n.t("No Mapped Data Items Available")}
				>
					{i18n.t("No pre-mapped data items were found for this configuration. Please run metadata migration first to generate data item mappings, or ensure that data items have been properly migrated from the source system.")}
				</NoticeBox>
			</div>
		);
	}    return (
		<div className="flex flex-col gap-4">
			<Field
				label={label}
				required={required}
				helpText={helpText || i18n.t("Select from pre-mapped data items from metadata migration")}
				error={!!error}
				validationText={error?.message}
			>
				<MultiSelectField
					selected={selectedValues}
					onChange={({ selected }) => handleSelectionChange(selected)}
					filterable
					placeholder={i18n.t("Search and select data items...")}
				>
					{options.map(option => (
						<MultiSelectOption
							key={option.value}
							label={option.label}
							value={option.value}
						/>
					))}
				</MultiSelectField>
			</Field>
		</div>
	);
}