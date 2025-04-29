import { useBoolean } from "usehooks-ts";
import { Button, IconAdd16 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import React from "react";
import { MenuItemForm } from "./MenuItemForm/MenuItemForm";
import { MenuItem } from "@packages/shared/schemas";

export function AddMenuItem({
	onAdd,
	sortOrder,
}: {
	onAdd: (item: MenuItem) => void;
	sortOrder: number;
}) {
	const {
		value: hide,
		setTrue: onClose,
		setFalse: onOpen,
	} = useBoolean(true);

	return (
		<>
			{!hide && (
				<MenuItemForm
					sortOrder={sortOrder}
					hide={hide}
					onClose={onClose}
					onSubmit={onAdd}
				/>
			)}
			<Button onClick={onOpen} icon={<IconAdd16 />}>
				{i18n.t("Add menu item")}
			</Button>
		</>
	);
}
