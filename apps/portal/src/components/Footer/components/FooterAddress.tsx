"use client";

import { ReachTextConfig } from "@packages/shared/schemas";
import { Box, Title } from "@mantine/core";
import JsxParser from "react-jsx-parser";

export function FooterAddress({ config }: { config: ReachTextConfig }) {
	const content = config?.content;

	return (
		<Box
			style={{
				width: "100%",
				maxHeight: 180,
			}}
		>
			<Title order={5}>Contacts</Title>
			<JsxParser
				onError={console.error}
				autoCloseVoidElements
				jsx={content}
			/>
		</Box>
	);
}
