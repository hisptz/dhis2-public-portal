import React, { useCallback, useMemo, useState } from "react";
import i18n from "@dhis2/d2-i18n";
import { Button, ButtonStrip, Card, Divider, SingleSelectField, SingleSelectOption } from "@dhis2/ui";
import { useFieldArray, useFormContext } from "react-hook-form";
import { DisplayItem, DisplayItemType, FlexibleLayoutConfig, VisualizationItem, VisualizationModule } from "@packages/shared/schemas";
import { mapValues } from "lodash";
import { useAlert } from "@dhis2/app-runtime";
import { AddVisualization } from "./AddVisualization/AddVisualization";
import { DashboardLayoutEditor } from "../../DashboardLayoutEditor";

type ItemsFieldPath = "config.items" | `config.groups.${number}.items`;
type LayoutsFieldPath = "config.layouts" | `config.groups.${number}.layouts`;

interface VisualizationLayoutEditorProps {
    prefix?: `config.groups.${number}`;
    onCancel: () => void;
    onSubmit: (data: VisualizationModule) => Promise<void>;
}

export function VisualizationManager({
    prefix,
    onCancel,
    onSubmit,
}: VisualizationLayoutEditorProps) {
    const { setValue, getValues, handleSubmit, formState, reset } = useFormContext<VisualizationModule>();
    const { show } = useAlert(
        ({ message }) => message,
        ({ type }) => ({ ...type, duration: 3000 })
    );
    const [size, setSize] = useState<number>(1200);

    const widths = useMemo(
        () => [
            { name: i18n.t("small screen"), value: 996 },
            { name: i18n.t("medium screen"), value: 1200 },
            { name: i18n.t("large screen"), value: 1500 },
        ],
        []
    );

    const itemsFieldPath: ItemsFieldPath = prefix ? `${prefix}.items` as `config.groups.${number}.items` : "config.items";
    const layoutsFieldPath: LayoutsFieldPath = prefix ? `${prefix}.layouts` as `config.groups.${number}.layouts` : "config.layouts";

    const { append, remove, fields } = useFieldArray<
        VisualizationModule,
        typeof itemsFieldPath,
        "fieldId"
    >({
        name: itemsFieldPath,
        keyName: "fieldId",
    });

    const onAddVisualization = useCallback(
        (visualization: VisualizationItem) => {
            if (fields.some(field => field.item.id === visualization.id)) {
                show({
                    message: i18n.t("This visualization is already added"),
                    type: { critical: true },
                });
                return;
            }

            const displayItem: DisplayItem = {
                type: DisplayItemType.VISUALIZATION,
                item: visualization,
            };
            append(displayItem);
            const layouts = getValues(layoutsFieldPath) as FlexibleLayoutConfig;
            if (layouts) {
                const updatedLayouts = mapValues(layouts, (value, key) => {
                    if (value) {
                        return [
                            ...value,
                            {
                                i: visualization.id,
                                x: 0,
                                y: 0,
                                w: key === "lg" ? 12 : key === "md" ? 10 : key === "sm" ? 6 : 4,
                                h: 8,
                            },
                        ];
                    }
                    return [
                        {
                            i: visualization.id,
                            x: 0,
                            y: 0,
                            w: key === "lg" ? 12 : key === "md" ? 10 : key === "sm" ? 6 : 4,
                            h: 8,
                        },
                    ];
                });
                setValue(layoutsFieldPath, updatedLayouts);
            } else {
                const newLayouts = {
                    lg: [{ i: visualization.id, x: 0, y: 0, w: 12, h: 8 }],
                    md: [{ i: visualization.id, x: 0, y: 0, w: 10, h: 8 }],
                    sm: [{ i: visualization.id, x: 0, y: 0, w: 6, h: 8 }],
                    xs: [{ i: visualization.id, x: 0, y: 0, w: 4, h: 8 }],
                };
                setValue(layoutsFieldPath, newLayouts);
            }
        },
        [fields, append, getValues, layoutsFieldPath, show, setValue]
    );

    const handleDelete = useCallback(
        (id: string) => {
            const index = fields.findIndex((field: DisplayItem & { fieldId: string }) => field.item.id === id);
            if (index === -1) {
                console.warn(`Item with id ${id} not found in fields`);
                return;
            }
            remove(index);
            const layouts = getValues(layoutsFieldPath) as FlexibleLayoutConfig;
            const updatedLayouts = Object.fromEntries(
                Object.entries(layouts).map(([key, value]) => [
                    key,
                    value ? value.filter((layoutItem) => layoutItem.i !== id) : [],
                ])
            );
            setValue(layoutsFieldPath, updatedLayouts);
            reset(getValues(), { keepDirty: true, keepTouched: true });
        },
        [fields, remove, getValues, setValue, reset, layoutsFieldPath]
    );

    const handleFormSubmit = useCallback(
        async (data: VisualizationModule) => {
            try {
                await onSubmit(data);
                reset(data, { keepDirty: false, keepTouched: true });
            } catch (error) {
                show({
                    message: i18n.t("Failed to save visualization", { error }),
                    type: { critical: true },
                });
            }
        },
        [onSubmit, reset, show]
    );

    const handleFormError = useCallback(
        (errors: any) => {
            console.error("Form validation errors:", errors);
            show({
                message: i18n.t("Please fix the validation errors before saving"),
                type: { critical: true },
            });
        },
        [show]
    );


    return (
        <div className="w-full h-full flex flex-col gap-4">
            <div className="w-full flex flex-col">
                <div className="flex justify-between gap-8">
                    <h2 className="text-2xl">{i18n.t("Manage visualization")}</h2>
                    <ButtonStrip end>
                        <Button onClick={onCancel}>{i18n.t("Cancel")}</Button>
                        <Button
                            primary
                            loading={formState.isSubmitting}
                            disabled={!formState.isDirty || formState.isSubmitting}
                            onClick={() => handleSubmit(handleFormSubmit, handleFormError)()}
                        >
                            {i18n.t("Save changes")}
                        </Button>
                    </ButtonStrip>
                </div>
                <Divider />
            </div>
            <div className="w-full flex-1">
                <Card className="p-4 mb-4 max-h-[100px] min-h-[100px]">
                    <div className="flex flex-row gap-8">
                        <div className="max-w-[300px] min-w-[300px]">
                            <SingleSelectField
                                selected={size.toString()}
                                onChange={({ selected }) => setSize(parseInt(selected))}
                                label={i18n.t("Select screen size")}
                            >
                                {widths.map(({ name, value }) => (
                                    <SingleSelectOption
                                        key={value.toString()}
                                        label={name}
                                        value={value.toString()}
                                    />
                                ))}
                            </SingleSelectField>
                        </div>
                        <div className="flex-col">
                            <h5 className="text-sm pb-5">{i18n.t("")}</h5>
                            <AddVisualization onAdd={onAddVisualization} />
                        </div>
                    </div>
                </Card>
                <DashboardLayoutEditor size={size} onDelete={handleDelete} prefix={prefix} />
                <div className="py-4">
                    <ButtonStrip end>
                        <Button onClick={onCancel}>{i18n.t("Cancel")}</Button>
                        <Button
                            primary
                            loading={formState.isSubmitting}
                            disabled={!formState.isDirty || formState.isSubmitting}
                            onClick={() => handleSubmit(handleFormSubmit, handleFormError)()}
                        >
                            {i18n.t("Save changes")}
                        </Button>
                    </ButtonStrip>
                </div>
            </div>
        </div>
    );
}