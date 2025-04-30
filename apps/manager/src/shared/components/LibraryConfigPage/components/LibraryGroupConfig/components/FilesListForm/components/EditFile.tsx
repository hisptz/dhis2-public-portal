import { LibraryFileData } from "@packages/shared/schemas";
import { useBoolean } from "usehooks-ts";
import { Button, IconEdit16 } from "@dhis2/ui";
import React from "react";
import { FileForm } from "./FileForm/FileForm";
import i18n from "@dhis2/d2-i18n";

export function EditFile({
	onUpdate,
	file,
	nested,
}: {
	onUpdate: (file: LibraryFileData) => void;
	file: LibraryFileData;
	nested?: boolean;
}) {
	const { value: hide, setTrue: onHide, setFalse: onOpen } = useBoolean(true);

	const onSave = (file: LibraryFileData) => {
		onHide();
		onUpdate(file);
	};

	return (
		<>
			<Button
				small
				title={i18n.t("Edit file")}
				onClick={onOpen}
				icon={<IconEdit16 />}
			/>
			{!hide && (
				<FileForm
					nested={nested}
					hide={hide}
					file={file}
					onSave={onSave}
					onClose={onHide}
				/>
			)}
		</>
	);
}
