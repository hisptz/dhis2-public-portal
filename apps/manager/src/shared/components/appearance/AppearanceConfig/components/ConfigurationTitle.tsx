import React from "react";

type Props = {
	title: string;
};

export function ConfigurationTitle({ title }: Props) {
	return (
		<>
			<h4 className="text-lg font-bold">{title}</h4>
			<hr className="border-gray-300 my-2" />
		</>
	);
}
