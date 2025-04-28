import { CircularLoader } from "@dhis2/ui";
import React from "react";

export function FullLoader() {
	return (
		<div className="h-full w-full flex justify-center items-center">
			<CircularLoader />
		</div>
	);
}
