import { useBoolean } from "usehooks-ts";
import { Button, IconDragHandle24 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import React from "react";
import { MenuItem } from "@packages/shared/schemas";
import { SortManual } from "./SortMenuItems";

export function SortButton({
	onAdd,
	items,
}: {
	items: MenuItem[];
	onAdd: (item: MenuItem) => void;
}) {
	const {
		value: hide,
		setTrue: onClose,
		setFalse: onOpen,
	} = useBoolean(true);

	return (
		<>
			{!hide && (
				<SortManual
					hide={hide}
					items={items}
					onClose={onClose}
					onSubmit={onAdd}
				/>
			)}
			<Button onClick={onOpen} >
				{i18n.t("Sort menu items")}
			</Button>
		</>
	);
}
