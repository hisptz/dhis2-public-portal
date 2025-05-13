import { DocumentItem } from "@packages/shared/schemas";
import { useBoolean } from "usehooks-ts";
import i18n from "@dhis2/d2-i18n";
import { Button, IconAdd24 } from "@dhis2/ui";
import React from "react";
import { FileForm } from "./FileForm/FileForm";

export function AddFile({
	onAdd,
	nested,
}: {
	onAdd: (file: DocumentItem) => void;
	nested?: boolean;
}) {
	const { value: hide, setTrue: onHide, setFalse: onOpen } = useBoolean(true);

	const onSave = (file: DocumentItem) => {
		onHide();
		onAdd(file);
	};

	return (
		<>
			<Button onClick={onOpen} icon={<IconAdd24 />}>
				{i18n.t("Add file")}
			</Button>
			{!hide && (
				<FileForm
					nested={nested}
					hide={hide}
					onSave={onSave}
					onClose={onHide}
				/>
			)}
		</>
	);
}
