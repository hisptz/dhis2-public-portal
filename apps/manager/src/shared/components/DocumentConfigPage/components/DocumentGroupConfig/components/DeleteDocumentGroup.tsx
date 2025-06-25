import { DocumentGroup } from "@packages/shared/schemas";
import { Button, IconDelete16 } from "@dhis2/ui";
import React from "react";
import i18n from "@dhis2/d2-i18n";
import { useDialog } from "@hisptz/dhis2-ui";

export function DeleteDocumentGroup({
	group,
	onRemove,
}: {
	onRemove: () => void;
	group: DocumentGroup;
}) {
	const { confirm } = useDialog();
	const onDeleteClick = async () => {
		confirm({
			title: i18n.t("Confirm deleting group"),
			message: (
				<span>{`${i18n.t("Are you sure you want to remove the group ")} ${group.title}? ${i18n.t("This will delete all files and sub groups in this group as well.")} ${i18n.t("This action is irreversible.")}`}</span>
			),
			onConfirm: async () => {
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
				dataTest={"remove-document-group-button"}
				small
				title={i18n.t("Delete group")}
				onClick={onDeleteClick}
				icon={<IconDelete16 />}
			/>
		</>
	);
}
