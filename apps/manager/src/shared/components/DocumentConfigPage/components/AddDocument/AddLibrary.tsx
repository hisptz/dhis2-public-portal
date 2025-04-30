import { useBoolean } from "usehooks-ts";
import { AddDocumentForm } from "./components/AddDocumentForm";
import React from "react";
import { Button, IconAdd24 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useNavigate } from "@tanstack/react-router";
import { LibraryData } from "@packages/shared/schemas";
import { useLibraries, useRefreshLibraries } from "../../../LibrariesProvider";

export function AddLibrary() {
	const libraries = useLibraries();
	const refreshLibraries = useRefreshLibraries();
	const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true);
	const navigate = useNavigate({
		from: "/library",
	});

	return (
		<>
			{!hide && (
				<AddDocumentForm
					onComplete={(library: LibraryData) => {
						refreshLibraries();
						navigate({
							to: "$libraryId/edit",
							params: {
								libraryId: library.id,
							},
						});
					}}
					hide={hide}
					onClose={onHide}
					sortOrder={libraries.length}
				/>
			)}
			<Button icon={<IconAdd24 />} primary onClick={onShow}>
				{i18n.t("Create a new library")}
			</Button>
		</>
	);
}
