import { Button, IconEdit16 } from "@dhis2/ui";
import React from "react";
import { DataServiceDataSourceItemsConfig } from "@packages/shared/schemas";
import { useBoolean } from "usehooks-ts";
import { DataItemConfigForm } from "./components/DataItemConfigForm";

export function EditDataItemConfig({
	onUpdate,
	config,
}: {
	onUpdate: (data: DataServiceDataSourceItemsConfig) => void;
	config: DataServiceDataSourceItemsConfig;
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
					data={config}
					onClose={onClose}
					onSubmit={onUpdate}
				/>
			)}
			<Button small onClick={onShow} icon={<IconEdit16 />} />
		</>
	);
}
