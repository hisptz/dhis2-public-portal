import { SingleSelectField, SingleSelectFieldProps, SingleSelectOption } from "@dhis2/ui";
import React from "react";
import { useController } from "react-hook-form";
import { RHFFieldProps } from "../../interfaces/interface";

export type NumberSelectOption = {
    label: string;
    value: number;
    disabled?: boolean;
};

export type RHFNumberSingleSelectFieldProps =
    Omit<SingleSelectFieldProps, 'selected' | 'onChange' | 'children'> &
    RHFFieldProps & {
        options: NumberSelectOption[];
    };

export function RHFNumberSingleSelectField({
    name,
    validations,
    options,
    ...props
}: RHFNumberSingleSelectFieldProps) {
    const { field, fieldState } = useController({
        name,
        rules: validations,
    });

    return (
        <SingleSelectField
            {...props}
            selected={
                field.value !== null && field.value !== undefined
                    ? String(field.value)
                    : ''
            }
            error={!!fieldState.error}
            validationText={fieldState.error?.message}
            onChange={({ selected }) => {
                if (selected !== '' && selected != null) {
                    field.onChange(Number(selected));
                } else {
                    field.onChange(null);
                }
            }}
        >
            {options.map(opt => (
                <SingleSelectOption
                    key={opt.value}
                    label={opt.label}
                    value={String(opt.value)}
                    disabled={opt.disabled}
                />
            ))}
        </SingleSelectField>
    );
}