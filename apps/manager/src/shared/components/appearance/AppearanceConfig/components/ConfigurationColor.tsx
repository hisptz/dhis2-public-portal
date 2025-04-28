import React from "react";

type Props = {
	colorCode: string;
};

export function ConfigurationColor({ colorCode }: Props) {
	return (
		<div
			className="w-8 h-8 rounded-sm border-1 border-gray-300"
			style={{
				backgroundColor: colorCode,
			}}
		></div>
	);
}
