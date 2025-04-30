import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import ErrorPage from "../../../../../../shared/components/ErrorPage/ErrorPage";
import { Button, IconArrowLeft24 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { PageHeader } from "../../../../../../shared/components/PageHeader";
import { LibraryConfigPage } from "../../../../../../shared/components/LibraryConfigPage/LibraryConfigPage";
import React from "react";
import { useLibrary } from "../../../../../../shared/components/LibraryProvider";
import { DeleteLibrary } from "../../../../../../shared/components/LibraryConfigPage/components/DeleteLibrary";

export const Route = createLazyFileRoute(
	"/library/_provider/$libraryId/_formProvider/edit/",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const library = useLibrary();
	const navigate = useNavigate();

	if (!library) {
		return <ErrorPage error={Error("Library not found")} />;
	}

	return (
		<div className="h-full w-full flex flex-col gap-2">
			<div>
				<Button
					onClick={() => {
						navigate({ to: "/library" });
					}}
					icon={<IconArrowLeft24 />}
				>
					{i18n.t("Back to all libraries")}
				</Button>
			</div>
			<PageHeader
				title={`${i18n.t("Library")} - ${library.label}`}
				actions={
					<div className="flex gap-4 items-center">
						<DeleteLibrary />
						<LibraryEditActions />
					</div>
				}
			/>
			<LibraryConfigPage />
		</div>
	);
}
