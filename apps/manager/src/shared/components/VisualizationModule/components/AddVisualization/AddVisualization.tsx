import { useBoolean } from "usehooks-ts";
import { AddVisualizationForm } from "./componets/AddVisualizationForm";
import { Button, IconAdd24 } from "@dhis2/ui";
import React from "react";
import i18n from "@dhis2/d2-i18n";
import { VisualizationItem } from "@packages/shared/schemas";

export function AddVisualization({
	onAdd,
}: {
	onAdd: (visualization: VisualizationItem) => void;
}) {
	const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true);

	return (
		<>
			{!hide && (
				<AddVisualizationForm
					hide={hide}
					onClose={onHide}
					onSubmit={onAdd}
				/>
			)}
			<Button onClick={onShow} icon={<IconAdd24 />}>
				{i18n.t("Add visualizations")}
			</Button>
		</>
	);
}
