import { Divider } from "@dhis2/ui";
import React, { ReactNode } from "react";

export function PageHeader({
	title,
	actions,
}: {
	title: string;
	actions?: ReactNode;
}) {
	return (
		<div className="flex flex-col">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">{title}</h1>
				{actions ?? null}
			</div>
			<Divider />
		</div>
	);
}
