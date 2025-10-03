import React from "react";
import i18n from "@dhis2/d2-i18n";
import { useBoolean } from "usehooks-ts";
import { SlideshowVisualization } from "@packages/shared/schemas";
import { AddSlideshowVisualizationItemForm } from "./AddSlideshowVisualizationItemForm";
import { Button } from "@dhis2/ui";

type Props = {
	onUpdate: (visualization: SlideshowVisualization) => void;
	visualization: SlideshowVisualization;
};

export function EditSlideshowVisualizationItem({
	onUpdate,
	visualization,
}: Props): React.ReactElement {
	const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true);

	return (
		<>
			{!hide && (
				<AddSlideshowVisualizationItemForm
					hide={hide}
					onClose={onHide}
					onSubmit={onUpdate}
					visualization={visualization}
				/>
			)}
			<Button
				dataTest="edit-slideshow-visualization-button"
				title={i18n.t("Edit slideshow item")}
				onClick={onShow}
			>
				{i18n.t("Edit")}
			</Button>
		</>
	);
}
