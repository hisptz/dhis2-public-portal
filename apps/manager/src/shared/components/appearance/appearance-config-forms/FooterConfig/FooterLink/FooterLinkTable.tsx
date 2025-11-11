import React from "react";
import { SimpleTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { FooterLink } from "@packages/shared/schemas";
import {
	Button,
	ButtonStrip,
	IconDelete16,
	IconEdit16,
	Tooltip,
} from "@dhis2/ui";

type Props = {
	fields: FooterLink[];
	update: (index: number, config: FooterLink) => void;
	remove: (index: number) => void;
};

const columns: SimpleTableColumn[] = [
	{
		key: "id",
		label: i18n.t("S/N"),
	},
	{
		key: "name",
		label: i18n.t("Name"),
	},
	{
		key: "url",
		label: i18n.t("Url"),
	},
	{
		label: i18n.t("Actions"),
		key: "action",
	},
];

export function FooterLinkTable({ fields, update, remove }: Props) {
	const rows = fields.map((field, index) => ({
		...field,
		id: `${index + 1}`,
		name: field.name,
		url: field.url,
		action: (
			<ButtonStrip>
				<Tooltip content={i18n.t("Remove Link")}>
					<Button
						icon={<IconDelete16 />}
						data-test="on-update-delete-footer-link-button"
						small
						onClick={() => remove(index)}
					/>
				</Tooltip>
				<Tooltip content={i18n.t("Edit link")}>
					<Button
						icon={<IconEdit16 />}
						data-test="on-update-edit-footer-link-button"
						small
						onClick={() => update(index, field)}
					/>
				</Tooltip>
			</ButtonStrip>
		),
	}));

	return (
		<SimpleTable
			emptyLabel={i18n.t("There are no Footer links defined")}
			columns={columns}
			rows={rows}
		/>
	);
}
