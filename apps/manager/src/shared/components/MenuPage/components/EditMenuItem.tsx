import { useBoolean } from "usehooks-ts";
import { Button, IconEdit16 } from "@dhis2/ui";
import React from "react";
import { MenuItemForm } from "./MenuItemForm/MenuItemForm";
import { MenuItem } from "@packages/shared/schemas";

export function EditMenuItem({
	onUpdate,
	item,
}: {
	onUpdate: (item: MenuItem) => void;
	item: MenuItem;
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
					config={item}
					hide={hide}
					onClose={onClose}
					onSubmit={onUpdate}
				/>
			)}
			<Button 
				data-test="edit-menu-item-button"
			 small onClick={onOpen} icon={<IconEdit16 />} />
		</>
	);
}
