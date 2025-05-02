import React, { useState } from "react";
import { Button, Field, FieldProps, IconAdd24, Label } from "@dhis2/ui";
import { useBoolean } from "usehooks-ts";
import { useFieldArray } from "react-hook-form";
import i18n from "@dhis2/d2-i18n";
import { FooterItemConfig } from "@packages/shared/schemas";
import { FooterItemTable } from "./FooterItemTable";
import { FooterItemForm } from "./FooterItemForm";

export interface InputFieldProps
	extends Omit<FieldProps, "warning" | "error" | "validationText"> {}

export function FooterItemConfigInput(props: InputFieldProps) {
	const [activeIndex, setActiveIndex] = useState<number | undefined>(
		undefined,
	);
	const { fields, append, remove, update } = useFieldArray({
		name: "footerItems",
	});

	const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true);

	const getSanitizedItems = (fields: any[]): FooterItemConfig[] => {
		return fields.map((field) => ({
			title: field.title,
			type: field.type,
		}));
	};

	return (
		<Field {...props}>
			<Label>{i18n.t("Footer Items")}</Label>
			{!hide && (
				<FooterItemForm
					onAdd={(data) => {
						if (activeIndex !== undefined) {
							update(activeIndex, data);
						} else {
							append(data);
						}
						setActiveIndex(undefined);
					}}
					onClose={onHide}
					hide={hide}
					config={
						activeIndex !== undefined
							? {
									title: fields[activeIndex]["title"] ?? "",
									type: fields[activeIndex]["type"] ?? "",
									links: fields[activeIndex]["links"] ?? [],
									staticContent:
										fields[activeIndex]["staticContent"] ??
										"",
								}
							: undefined
					}
				/>
			)}

			<div className="flex flex-col gap-2 ">
				<div className="flex-1 ml-2">
					<FooterItemTable
						fields={getSanitizedItems(fields)}
						update={(index, config) => {
							setActiveIndex(index);
							onShow();
						}}
						remove={remove}
					/>
				</div>

				<div className="w-auto">
					<Button small onClick={onShow} icon={<IconAdd24 />}>
						{i18n.t("Add footer item")}
					</Button>
				</div>
			</div>
		</Field>
	);
}
