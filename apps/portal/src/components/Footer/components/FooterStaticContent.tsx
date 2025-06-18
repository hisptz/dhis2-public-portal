"use client";

import { Box, Title } from "@mantine/core";
import JsxParser from "react-jsx-parser";

export function FooterStaticContent({
	config,
}: {
	config: {
		title: string;
		staticContent: string;
	};
}) {
	const { staticContent: content, title } = config;

	return (
		<Box
			style={{
				width: "100%",
			}}
		>
			<Title order={5}>{title}</Title>
			<JsxParser
				onError={console.error}
				autoCloseVoidElements
				jsx={content}
			/>
		</Box>
	);
}
