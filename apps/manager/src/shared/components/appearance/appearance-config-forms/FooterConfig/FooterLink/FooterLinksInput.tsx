import React, { useState } from "react";
import { Button, Field, FieldProps, IconAdd24, Label } from "@dhis2/ui";
import { useBoolean } from "usehooks-ts";
import { useFieldArray } from "react-hook-form";
import i18n from "@dhis2/d2-i18n";
import { FooterLinkForm } from "./FooterLinkForm";
import { FooterLink } from "@packages/shared/schemas";
import { FooterLinkTable } from "./FooterLinkTable";

export interface InputFieldProps
	extends Omit<FieldProps, "warning" | "error" | "validationText"> {}

export function FooterLinksInput(props: InputFieldProps) {
	const [activeIndex, setActiveIndex] = useState<number | undefined>(
		undefined,
	);
	const { fields, append, remove, update } = useFieldArray({
		name: "links",
	});

	const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true);

	const getSanitizedLinks = (fields: any[]): FooterLink[] => {
		return fields.map((field) => ({
			name: field.name,
			url: field.url,
		}));
	};

	return (
		<Field {...props}>
			<Label>{i18n.t("Footer links")}</Label>
			{!hide && (
				<FooterLinkForm
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
									name: fields[activeIndex]["name"] ?? "",
									url: fields[activeIndex]["url"] ?? "",
								}
							: undefined
					}
				/>
			)}

			<div className="flex flex-col gap-2 ">
				<div className="flex-1 ml-2">
					<FooterLinkTable
						fields={getSanitizedLinks(fields)}
						update={(index, config) => {
							setActiveIndex(index);
							onShow();
						}}
						remove={remove}
					/>
				</div>

				<div className="w-auto">
					<Button small onClick={onShow} icon={<IconAdd24 />} data-test="add-footer-link-button">
						{i18n.t("Add footer link")}
					</Button>
				</div>
			</div>
		</Field>
	);
}
