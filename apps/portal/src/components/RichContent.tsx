"use client";

import JsxParser from "react-jsx-parser";

export function RichContent({ content }: { content: string }) {
	return (
		<>
			{/*@ts-ignore*/}
			<JsxParser
				autoCloseVoidElements
				renderError={({ error }) => {
					return <div>{error}</div>;
				}}
				onError={(error) => {
					console.error(error);
				}}
				jsx={content}
			/>
		</>
	);
}
