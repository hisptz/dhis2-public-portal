import { DocumentGroup } from "@packages/shared/schemas";
import { useBoolean } from "usehooks-ts";
import { Button, IconAdd24 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import React from "react";
import { DocumentGroupForm } from "./DocumentGroupForm";

export function AddDocumentGroup({
	onAdd,
	nested,
	sortOrder,
}: {
	onAdd: (group: DocumentGroup) => void;
	nested?: boolean;
	sortOrder?: number;
}) {
	const { value: hide, setTrue: onHide, setFalse: onOpen } = useBoolean(true);

	const onSave = (group: DocumentGroup) => {
		onHide();
		onAdd(group);
	};

	return (
		<>
			{!hide && (
				<DocumentGroupForm
					nested={nested}
					hide={hide}
					onClose={onHide}
					onSave={onSave}
					sortOrder={sortOrder}
				/>
			)}
			<Button onClick={onOpen} icon={<IconAdd24 />}>
				{i18n.t("Add group")}
			</Button>
		</>
	);
}
