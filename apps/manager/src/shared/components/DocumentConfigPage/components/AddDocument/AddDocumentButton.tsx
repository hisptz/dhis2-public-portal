import { useBoolean } from "usehooks-ts";
import { AddDocumentForm } from "./components/AddDocumentForm";
import React from "react";
import { Button, IconAdd24 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { DocumentItem } from "@packages/shared/schemas";

export function AddDocumentButton({
	onAdd,
	sortOrder,
}: {
	onAdd: (visualization: DocumentItem) => void;
	sortOrder?: number;
}) {
	const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true);

	return (
		<>
			{!hide && (
				<AddDocumentForm
					hide={hide}
					onClose={onHide}
					onSubmit={onAdd}
					sortOrder={sortOrder}
				/>
			)}
			<Button onClick={onShow} icon={<IconAdd24 />}>
				{i18n.t("Add document")}
			</Button>
		</>
	);
}
