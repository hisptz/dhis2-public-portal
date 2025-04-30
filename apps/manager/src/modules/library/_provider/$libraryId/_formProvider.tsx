import { createFileRoute, Outlet } from "@tanstack/react-router";
import { LibraryProvider } from "../../../../shared/components/LibraryProvider";
import { LibraryFormProvider } from "../../../../shared/components/DocumentConfigPage/components/LibraryFormProvider";
import React from "react";

export const Route = createFileRoute(
	"/library/_provider/$libraryId/_formProvider",
)({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<LibraryProvider>
			<LibraryFormProvider>
				<Outlet />
			</LibraryFormProvider>
		</LibraryProvider>
	);
}
