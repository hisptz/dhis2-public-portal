import { DocumentGroup } from "@packages/shared/schemas";
import { useBoolean } from "usehooks-ts";
import { Button, IconEdit16 } from "@dhis2/ui";
import React from "react";
import { DocumentGroupForm } from "./DocumentGroupForm";
import i18n from "@dhis2/d2-i18n";

export function EditDocumentGroup({
	onUpdate,
	group,
}: {
	onUpdate: (group: DocumentGroup) => void;
	group: DocumentGroup;
}) {
	const { value: hide, setTrue: onHide, setFalse: onOpen } = useBoolean(true);

	const onSave = (group: DocumentGroup) => {
		onHide();
		onUpdate(group);
	};

	return (
		<>
			<Button
				dataTest={"edit-document-group-button"}
				small
				title={i18n.t("Edit group")}
				onClick={onOpen}
				icon={<IconEdit16 />}
			/>
			{!hide && (
				<DocumentGroupForm
					group={group}
					hide={hide}
					onClose={onHide}
					onSave={onSave}
				/>
			)}
		</>
	);
}
