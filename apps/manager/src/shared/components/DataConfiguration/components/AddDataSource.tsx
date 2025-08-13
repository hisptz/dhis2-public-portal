import { useBoolean } from "usehooks-ts";
import { Button, IconAdd24 } from "@dhis2/ui";
import React from "react";
import { AddDataSourceForm } from "./AddDataSourceForm";
import i18n from "@dhis2/d2-i18n";

export function AddDataSource() {
	const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true);

	return (
		<>
			{!hide && <AddDataSourceForm onClose={onHide} hide={hide} />}
			<Button primary icon={<IconAdd24 />} onClick={onShow}>
				{i18n.t("Add data configuration")}
			</Button>
		</>
	);
}
