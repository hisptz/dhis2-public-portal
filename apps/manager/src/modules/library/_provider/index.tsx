import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { PageHeader } from "../../../shared/components/PageHeader";
import i18n from "@dhis2/d2-i18n";
import { LibraryList } from "../../../shared/components/LibraryList/LibraryList";
import { AddLibrary } from "../../../shared/components/LibraryConfigPage/components/AddLibrary/AddLibrary";

export const Route = createFileRoute("/library/_provider/")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="h-full w-full flex flex-col">
			<PageHeader actions={<AddLibrary />} title={i18n.t("Libraries")} />
			<div className="flex-1">
				<LibraryList />
			</div>
		</div>
	);
}
