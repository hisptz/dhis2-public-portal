import React from "react";
import { Button, IconAdd24 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useBoolean } from "usehooks-ts";
import { SlideshowVisualization } from "@packages/shared/schemas";
import { AddSlideshowVisualizationItemForm } from "./components/AddSlideshowVisualizationItemForm";

export function AddSlideshowVisualizationItem({
	onAdd,
}: {
	onAdd: (visualization: SlideshowVisualization) => void;
}) {
	const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true);

	return (
		<>
			{!hide && (
				<AddSlideshowVisualizationItemForm
					hide={hide}
					onClose={onHide}
					onSubmit={onAdd}
				/>
			)}
			<Button onClick={onShow} icon={<IconAdd24 />}>
				{i18n.t("Add slideshow item")}
			</Button>
		</>
	);
}
