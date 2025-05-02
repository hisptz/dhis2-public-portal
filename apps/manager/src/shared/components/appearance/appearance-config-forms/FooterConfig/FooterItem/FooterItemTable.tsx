import React from "react";
import { SimpleTable, SimpleTableColumn } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { FooterItemConfig } from "@packages/shared/schemas";
import { Button, ButtonStrip, IconDelete16, IconEdit16 } from "@dhis2/ui";
import { capitalize } from "lodash";

type Props = {
	fields: FooterItemConfig[];
	update: (index: number, config: FooterItemConfig) => void;
	remove: (index: number) => void;
};

const columns: SimpleTableColumn[] = [
	{
		key: "id",
		label: i18n.t("S/N"),
	},
	{
		key: "title",
		label: i18n.t("Title"),
	},
	{
		key: "type",
		label: i18n.t("Type"),
	},
	{
		label: i18n.t("Actions"),
		key: "action",
	},
];

export function FooterItemTable({ fields, update, remove }: Props) {
	const rows = fields.map((field, index) => ({
		...field,
		id: `${index + 1}`,
		title: field.title,
		type: capitalize(field.type),
		action: (
			<ButtonStrip>
				<Button
					icon={<IconDelete16 />}
					small
					onClick={() => remove(index)}
				/>
				<Button
					icon={<IconEdit16 />}
					small
					onClick={() => update(index, field)}
				/>
			</ButtonStrip>
		),
	}));

	return (
		<SimpleTable
			rows={rows}
			columns={columns}
			emptyLabel={i18n.t("No footer items configured")}
		/>
	);
}
