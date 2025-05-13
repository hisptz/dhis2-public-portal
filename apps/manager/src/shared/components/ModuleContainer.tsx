import React from "react";
import { ModuleTitle } from "./ModuleTitle";

export function ModuleContainer({
	title,
	children,
}: {
	title: string;
	children: React.ReactNode;
}) {
	return (
		<div className="w-full h-full flex flex-col gap-2">
			<ModuleTitle title={title} />
			<div className="flex-1">{children}</div>
		</div>
	);
}
