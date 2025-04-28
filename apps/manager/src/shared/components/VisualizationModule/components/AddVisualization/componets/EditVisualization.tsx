import { useBoolean } from "usehooks-ts";
import { AddVisualizationForm } from "./AddVisualizationForm";
import { Button, IconEdit16 } from "@dhis2/ui";
import React from "react";
 import i18n from "@dhis2/d2-i18n";
import { VisualizationItem } from "@packages/shared/schemas";

export function EditVisualization({
	onUpdate,
	visualization,
}: {
	onUpdate: (data: VisualizationItem) => void;
	visualization: VisualizationItem;
}) {
	const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true);

	return (
		<>
			{!hide && (
				<AddVisualizationForm
					visualization={visualization}
					hide={hide}
					onClose={onHide}
					onSubmit={onUpdate}
				/>
			)}
			<Button
				title={i18n.t("Edit visualization")}
				onClick={onShow}
				icon={<IconEdit16 />}
			/>
		</>
	);
}
