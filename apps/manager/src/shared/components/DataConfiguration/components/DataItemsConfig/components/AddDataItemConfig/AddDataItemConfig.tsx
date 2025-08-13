import { Button, IconAdd24 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import React from "react";
import { DataServiceDataSourceItemsConfig } from "@packages/shared/schemas";
import { useBoolean } from "usehooks-ts";
import { DataItemConfigForm } from "./components/DataItemConfigForm";

export function AddDataItemConfig({
	onAdd,
}: {
	onAdd: (data: DataServiceDataSourceItemsConfig) => void;
}) {
	const {
		value: hide,
		setTrue: onClose,
		setFalse: onShow,
	} = useBoolean(true);
	return (
		<>
			{!hide && (
				<DataItemConfigForm
					hide={hide}
					onClose={onClose}
					onSubmit={onAdd}
				/>
			)}
			<Button onClick={onShow} icon={<IconAdd24 />}>
				{i18n.t("Add data item")}
			</Button>
		</>
	);
}
