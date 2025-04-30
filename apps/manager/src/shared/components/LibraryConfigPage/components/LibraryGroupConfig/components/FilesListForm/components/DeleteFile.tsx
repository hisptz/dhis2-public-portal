import { useDialog } from "@hisptz/dhis2-ui";
import { Button, IconDelete16 } from "@dhis2/ui";
import React from "react";
import i18n from "@dhis2/d2-i18n";
import { LibraryFileData } from "@packages/shared/schemas";
import { useDeleteDocument } from "./FileForm/hooks/file";

export function DeleteFile({
	file,
	onRemove,
}: {
	file: LibraryFileData;
	onRemove: () => void;
}) {
	const { confirm } = useDialog();
	const { deleteFile } = useDeleteDocument();

	const onDelete = async () => {
		confirm({
			title: i18n.t("Confirm deleting file"),
			message: (
				<span>{`${i18n.t("Are you sure you want to remove the file ")} ${file.label}? ${i18n.t("This action is irreversible.")}`}</span>
			),
			onConfirm: async () => {
				await deleteFile(file.id);
				onRemove();
			},
			loadingText: i18n.t("Deleting..."),
			confirmButtonText: i18n.t("Delete"),
			position: "middle",
		});
	};

	return (
		<>
			<Button
				small
				onClick={onDelete}
				icon={<IconDelete16 />}
				title={i18n.t("Delete icon")}
			/>
		</>
	);
}
