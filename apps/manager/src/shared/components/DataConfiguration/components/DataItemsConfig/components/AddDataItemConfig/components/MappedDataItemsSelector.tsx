import React, { useEffect, useMemo, useState } from "react";
import { useController, useFormContext } from "react-hook-form";
import { Field, MultiSelectField, MultiSelectOption, NoticeBox } from "@dhis2/ui";
import { useDataQuery } from "@dhis2/app-runtime";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { DataServiceDataSourceItemsConfig } from "@packages/shared/schemas";
import i18n from "@dhis2/d2-i18n";

interface MappedItem {
    id: string;
    sourceId: string;
}

interface ItemsConfig {
    id: string;
    name: string;
    dataItems?: MappedItem[];
}

interface ConfigData {
    dataItems?: MappedItem[];
    itemsConfig?: ItemsConfig[];
}

interface Metadata {
    id: string;
    displayName?: string;
    name?: string;
}

interface MetadataResponse {
    dataElements?: Metadata[];
    categoryOptionCombos?: Metadata[];
}

const DATASTORE_QUERY = {
    mappings: {
        resource: `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}`,
        id: ({ configId }: { configId: string }) => configId,
        params: { fields: "dataItems,itemsConfig" },
    },
} as const;

const METADATA_QUERY = {
    dataElements: {
        resource: "dataElements",
        params: ({ ids }: { ids?: string }) => ({
            fields: "id,displayName,name",
            filter: ids ? `id:in:[${ids}]` : undefined,
            paging: false,
        }),
    },
    categoryOptionCombos: {
        resource: "categoryOptionCombos",
        params: ({ ids }: { ids?: string }) => ({
            fields: "id,displayName,name",
            filter: ids ? `id:in:[${ids}]` : undefined,
            paging: false,
        }),
    },
} as const;

interface Props {
    configId: string;
    name: keyof DataServiceDataSourceItemsConfig;
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
}: Props) {
    const { control } = useFormContext<DataServiceDataSourceItemsConfig>();

    const {
        field: { value, onChange },
        fieldState: { error },
    } = useController({
        name,
        control,
        rules: { required: required && i18n.t("At least one data item is required") },
    });

    const [metadataIds, setMetadataIds] = useState({
        dataElements: "",
        categoryOptionCombos: "",
    });

    const { data: configData, loading: configLoading, error: configError } = useDataQuery<{
        mappings: ConfigData;
    }>(DATASTORE_QUERY, { variables: { configId } });

    const { data: metadata, loading: metadataLoading, refetch } = useDataQuery<{
        dataElements?: MetadataResponse;
        categoryOptionCombos?: MetadataResponse;
    }>(METADATA_QUERY, { lazy: true });

    useEffect(() => {
        if (!configData?.mappings) return;

        const allItems: MappedItem[] = [
            ...(configData.mappings.dataItems || []),
            ...(configData.mappings.itemsConfig || []).flatMap((c) => c.dataItems || []),
        ];

        const deSet = new Set<string>();
        const cocSet = new Set<string>();

        allItems.forEach((item) => {
            if (item.sourceId.includes(".")) {
                const [de, coc] = item.sourceId.split(".");
                deSet.add(de);
                cocSet.add(coc);
            } else {
                deSet.add(item.sourceId);
            }
        });

        const deIds = Array.from(deSet).join(",");
        const cocIds = Array.from(cocSet).join(",");

        if (deIds || cocIds) {
            setMetadataIds({ dataElements: deIds, categoryOptionCombos: cocIds });
            refetch({
                dataElements: { ids: deIds },
                categoryOptionCombos: { ids: cocIds },
            });
        }
    }, [configData, refetch]);

    const options = useMemo(() => {
        if (!configData?.mappings || metadataLoading) return [];

        const allItems: MappedItem[] = [
            ...(configData.mappings.dataItems || []),
            ...(configData.mappings.itemsConfig || []).flatMap((c) => c.dataItems || []),
        ];

        const uniqueItems = allItems.filter(
            (item, index, self) => self.findIndex((i) => i.id === item.id) === index
        );

        const deMap = new Map<string, string>();
        const cocMap = new Map<string, string>();

        metadata?.dataElements?.dataElements?.forEach((de) => {
            deMap.set(de.id, de.displayName || de.name || de.id);
        });

        metadata?.categoryOptionCombos?.categoryOptionCombos?.forEach((coc) => {
            cocMap.set(coc.id, coc.displayName || coc.name || coc.id);
        });

        return uniqueItems.map((item) => {
            let label: string;
            if (item.sourceId.includes(".")) {
                const [deId, cocId] = item.sourceId.split(".");
                const deName = deMap.get(deId) || deId;
                const cocName = cocMap.get(cocId) || cocId;
                label = `${deName} (${cocName})`;
            } else {
                label = deMap.get(item.sourceId) || item.sourceId;
            }
            return { label, value: item.id };
        });
    }, [configData, metadata, metadataLoading]);

    const handleChange = (selected: string[]) => {
        const allItems: MappedItem[] = [
            ...(configData?.mappings?.dataItems || []),
            ...(configData?.mappings?.itemsConfig || []).flatMap((c) => c.dataItems || []),
        ];

        const selectedItems = selected.map((id) => {
            const item = allItems.find((i) => i.id === id);
            return { id, sourceId: item?.sourceId || id };
        });

        onChange(selectedItems);
    };

    const selectedValues = useMemo(
        () => (Array.isArray(value) ? value.map((v: MappedItem) => v.id) : []),
        [value]
    );

    if (configLoading || metadataLoading) {
        return (
            <Field label={label} required={required} helpText={helpText}>
                <MultiSelectField
                    selected={[]}
                    onChange={() => { }}
                    filterable
                    placeholder={i18n.t("Loading...")}
                    disabled
                />
            </Field>
        );
    }

    if (configError) {
        return (
            <>
                <Field label={label} required={required} />
                <NoticeBox error title={i18n.t("Failed to Load Mapped Data Items")}>
                    {i18n.t(
                        "Error loading configuration. Ensure metadata migration is complete and config exists."
                    )}
                </NoticeBox>
            </>
        );
    }

    if (!options.length) {
        return (
            <>
                <Field label={label} required={required} />
                <NoticeBox warning title={i18n.t("No Mapped Data Items")}>
                    {i18n.t("Run metadata migration to generate mappings.")}
                </NoticeBox>
            </>
        );
    }

    return (
        <Field
            label={label}
            required={required}
            helpText={helpText || i18n.t("Select from mapped data items from metadata migration")}
            error={!!error}
            validationText={error?.message}
        >
            <MultiSelectField
                selected={selectedValues}
                onChange={({ selected }) => handleChange(selected)}
                filterable
                placeholder={i18n.t("Search and select data items...")}
            >
                {options.map((opt) => (
                    <MultiSelectOption key={opt.value} label={opt.label} value={opt.value} />
                ))}
            </MultiSelectField>
        </Field>
    );
}