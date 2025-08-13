import i18n from "@dhis2/d2-i18n";
import { Button, IconAdd24 } from "@dhis2/ui";
import React from "react";
import { useBoolean } from "usehooks-ts";
import { DataItemForm } from "./DataItemForm/DataItemForm";
import { DataServiceDataItemConfig } from "@packages/shared/schemas";

export function ManualDataItem({
	onAdd,
}: {
	onAdd: (data: DataServiceDataItemConfig) => void;
}) {
	const {
		value: hide,
		setTrue: onClose,
		setFalse: onShow,
	} = useBoolean(true);
	return (
		<>
			<Button
				icon={<IconAdd24 />}
				onClick={() => {
					onShow();
				}}
			>
				{i18n.t("Add data item")}
			</Button>
			{!hide && (
				<DataItemForm hide={hide} onClose={onClose} onSubmit={onAdd} />
			)}
		</>
	);
}
