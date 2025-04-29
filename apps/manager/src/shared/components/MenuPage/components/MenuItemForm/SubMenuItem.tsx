import { ModuleMenuItem } from "@packages/shared/schemas";
import { useBoolean } from "usehooks-ts";
import { SubMenuForm } from "./SubMenuForm";
import React from "react";
import { Chip } from "@dhis2/ui";

export function SubMenuItem({
	item,
	onUpdate,
	onRemove,
	parentPath,
}: {
	item: ModuleMenuItem;
	onUpdate: (item: ModuleMenuItem) => void;
	onRemove: (index: number) => void;
	parentPath: string;
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
					parentPath={parentPath}
					hide={hide}
					onClose={onClose}
					onSubmit={onUpdate}
					menu={item}
				/>
			)}
			<Chip onClick={onOpen} onRemove={onRemove} dense>
				{item.label}
			</Chip>
		</>
	);
}
