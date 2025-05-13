import React from "react";
import { useController } from "react-hook-form";
import { AppMenuConfig, MenuPosition,DocumentsModuleConfig, ItemsDisplay, DocumentsModule } from "@packages/shared/schemas";
import { Field, Radio } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";

export function ItemDisplayConfig() {
    const { field, fieldState } = useController<DocumentsModule, "config.itemsDisplay">({
        name: "config.itemsDisplay",
    });
    return (
        <Field
            {...field}
            required
            validationText={fieldState?.error?.message}
            name="config.itemsDisplay"
            error={!!fieldState.error}
            label={i18n.t("Item Display")}
        >
            <div className="flex gap-4 items-center">
                <Radio
                    onChange={({ checked }) => {
                        if (checked) {
                            field.onChange(ItemsDisplay.SEGMENTED);
                        }
                    }}
                    checked={field.value === ItemsDisplay.SEGMENTED}
                    label={i18n.t("Segmented")}
                    value={ItemsDisplay.SEGMENTED}
                />
                <Radio
                    onChange={({ checked }) => {
                        if (checked) {
                            field.onChange(ItemsDisplay.DROPDOWN);
                        }
                    }}
                    checked={field.value === ItemsDisplay.DROPDOWN}
                    label={i18n.t("DropDown")}
                    value={ItemsDisplay.DROPDOWN}
                />
            </div>
        </Field>
    );
}
