import { useBoolean } from "usehooks-ts";
import { AddHighlightedItemForm } from "./AddHighlightedItemForm";
import { Button, IconEdit16 } from "@dhis2/ui";
import React from "react";
import i18n from "@dhis2/d2-i18n";
import { HighlightedSingleValueConfig } from "@packages/shared/schemas";

export function EditHighlightedItem({
	onUpdate,
	visualization,
}: {
	onUpdate: (data: HighlightedSingleValueConfig) => void;
	visualization: HighlightedSingleValueConfig;
}) {
	const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true);

	return (
		<>
			{!hide && (
				<AddHighlightedItemForm
					visualization={visualization}
					hide={hide}
					onClose={onHide}
					onSubmit={onUpdate}
				/>
			)}
			<Button
				title={i18n.t("Edit item")}
				onClick={onShow}
				icon={<IconEdit16 />}
			/>
		</>
	);
}
