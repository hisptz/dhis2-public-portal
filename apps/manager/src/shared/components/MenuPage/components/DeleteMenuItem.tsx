import { Button, IconDelete16 } from "@dhis2/ui";
import React from "react";
import { MenuItem } from "@packages/shared/schemas";
import { useDialog } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";

export function DeleteMenuItem({
	onDelete,
	item,
}: {
	onDelete: () => void;
	item: MenuItem;
}) {
	const { confirm } = useDialog();

	return (
		<>
			<Button
				small
				onClick={() => {
					confirm({
						title: i18n.t("Confirm delete"),
						message: (
							<span>
								{`${i18n.t(
									"Are you sure you want to delete the menu item ",
									{
										item: item.label,
									},
								)}`}
								<b>{item.label}</b>? Once saved, this is
								irreversible.
							</span>
						),
						onConfirm: () => {
							onDelete();
						},
						confirmButtonText: i18n.t("Delete"),
					});
				}}
				icon={<IconDelete16 />}
			/>
		</>
	);
}
