import { LibraryGroupData } from "@packages/shared/schemas";
import { useBoolean } from "usehooks-ts";
import { Button, IconEdit16 } from "@dhis2/ui";
import React from "react";
import { LibraryGroupForm } from "./LibraryGroupForm";
import i18n from "@dhis2/d2-i18n";

export function EditLibraryGroup({
	onUpdate,
	group,
}: {
	onUpdate: (group: LibraryGroupData) => void;
	group: LibraryGroupData;
}) {
	const { value: hide, setTrue: onHide, setFalse: onOpen } = useBoolean(true);

	const onSave = (group: LibraryGroupData) => {
		onHide();
		onUpdate(group);
	};

	return (
		<>
			<Button
				small
				title={i18n.t("Edit group")}
				onClick={onOpen}
				icon={<IconEdit16 />}
			/>
			{!hide && (
				<LibraryGroupForm
					group={group}
					hide={hide}
					onClose={onHide}
					onSave={onSave}
				/>
			)}
		</>
	);
}
