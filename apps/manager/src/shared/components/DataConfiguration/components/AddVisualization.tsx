import i18n from "@dhis2/d2-i18n";
import { Button, IconAdd24 } from "@dhis2/ui";
import React from "react";

export function AddVisualization() {
	return <Button icon={<IconAdd24 />}>{i18n.t("Add visualization")}</Button>;
}
