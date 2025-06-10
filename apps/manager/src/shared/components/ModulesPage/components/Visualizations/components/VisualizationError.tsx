import { FallbackProps } from "react-error-boundary";
import { Button, IconError24 } from "@dhis2/ui";
import React from "react";
import i18n from "@dhis2/d2-i18n";

export function VisualizationError({
	error,
	resetErrorBoundary,
}: FallbackProps) {
	return (
		<div className="h-full w-full flex flex-col gap-2 justify-center items-center">
			<IconError24 />
			<span>{error.message}</span>
			<Button onClick={resetErrorBoundary} small>
				{i18n.t("Try again")}
			</Button>
		</div>
	);
}
