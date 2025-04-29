import { useBoolean } from "usehooks-ts";
import { SubMenuForm } from "./SubMenuForm";
import { ModuleMenuItem } from "@packages/shared/schemas";
import React from "react";
import { Button, IconAdd16 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";

export function AddSubMenuItem({
	parentPath,
	sortOrder,
	onAdd,
}: {
	parentPath: string;
	onAdd: (menu: ModuleMenuItem) => void;
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
				<SubMenuForm
					sortOrder={sortOrder}
					hide={hide}
					onClose={onClose}
					onSubmit={onAdd}
					parentPath={parentPath}
				/>
			)}
			<Button icon={<IconAdd16 />} onClick={onOpen} small>
				{i18n.t("Add sub item")}
			</Button>
		</>
	);
}
