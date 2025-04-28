import React from "react";

type Props = {
	title: string;
	value?: string;
	children?: React.ReactNode;
};

export function ConfigurationDetails({ title, value, children }: Props) {
	return (
		<div className="flex flex-col">
			<p className="text-sm">
				<span className="text-gray-500">{title}: </span>
				{!children && (
					<span className="text-gray-900">{value ?? "N/A"}</span>
				)}
			</p>
			{children && <div className="flex-1 my-1">{children}</div>}
		</div>
	);
}
