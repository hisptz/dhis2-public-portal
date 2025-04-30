import { LibraryGroupData } from "@packages/shared/schemas";
import { useBoolean } from "usehooks-ts";
import { Button, IconAdd24 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import React from "react";
import { LibraryGroupForm } from "./LibraryGroupForm";

export function AddLibraryGroup({
	onAdd,
	nested,
}: {
	onAdd: (group: LibraryGroupData) => void;
	nested?: boolean;
}) {
	const { value: hide, setTrue: onHide, setFalse: onOpen } = useBoolean(true);

	const onSave = (group: LibraryGroupData) => {
		onHide();
		onAdd(group);
	};

	return (
		<>
			<Button onClick={onOpen} icon={<IconAdd24 />}>
				{i18n.t("Add group")}
			</Button>
			{!hide && (
				<LibraryGroupForm
					nested={nested}
					hide={hide}
					onClose={onHide}
					onSave={onSave}
				/>
			)}
		</>
	);
}
