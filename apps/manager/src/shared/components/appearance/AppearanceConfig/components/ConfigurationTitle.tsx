import React from "react";

type Props = {
	title: string;
};

export function ConfigurationTitle({ title }: Props) {
	const dataTestId = `configuration-title-${title}`;
	console.log(`Rendering ConfigurationTitle with data-test: ${dataTestId}`);
	return (
		<>
			<h3 data-test ={dataTestId} className="text-lg font-bold">{title}</h3>
			<hr className="border-gray-300 my-2" />
		</>
	);
}
