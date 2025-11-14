import { useBoolean } from "usehooks-ts";
import { Button } from "@dhis2/ui";
import React from "react";
import i18n from "@dhis2/d2-i18n";
import { EditConnectionForm } from "./EditConnectionForm";

export function EditConnectionButton() {
	const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true);

	return (
		<>
			{!hide && <EditConnectionForm onClose={onHide} hide={hide} />}
			<Button onClick={onShow}>
				{i18n.t("Edit connection")}
			</Button>
		</>
	);
}
