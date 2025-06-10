import { useBoolean } from "usehooks-ts";
import { AddHighlightedItemForm } from "./componets/AddHighlightedItemForm";
import { Button, IconAdd24 } from "@dhis2/ui";
import React from "react";
import i18n from "@dhis2/d2-i18n";
import { HighlightedSingleValueConfig } from "@packages/shared/schemas";

export function AddHighlightedItem({
	onAdd,
}: {
	onAdd: (visualization: HighlightedSingleValueConfig) => void;
}) {
	const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true);

	return (
		<>
			{!hide && (
				<AddHighlightedItemForm
					hide={hide}
					onClose={onHide}
					onSubmit={onAdd}
				/>
			)}
			<Button onClick={onShow} icon={<IconAdd24 />}>
				{i18n.t("Add item")}
			</Button>
		</>
	);
}
