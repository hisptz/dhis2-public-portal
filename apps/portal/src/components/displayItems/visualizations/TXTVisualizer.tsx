"use client";

import React, { useState, useEffect } from "react";
import { Box, Text, LoadingOverlay } from "@mantine/core";
import { IconFileText } from "@tabler/icons-react";

export interface TXTVisualizerProps {
	path: string;
}

export function TXTVisualizer({ path }: TXTVisualizerProps) {
	const [content, setContent] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadTextContent = React.useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch(path);

			if (!response.ok) {
				throw new Error(`Failed to load text file: ${response.statusText}`);
			}

			const text = await response.text();

 			const preview = text.length > 200 ? text.substring(0, 200) + "..." : text;
			setContent(preview);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load text content");
		} finally {
			setLoading(false);
		}
	}, [path]);

	useEffect(() => {
		loadTextContent();
	}, [loadTextContent]);

	if (loading) {
		return (
			<Box className="w-full flex items-center justify-center h-[160px]">
				<LoadingOverlay
					visible={true}
					zIndex={1000}
					loaderProps={{
						size: "sm",
					}}
					overlayProps={{ radius: "sm", blur: 2 }}
				/>
			</Box>
		);
	}

	if (error) {
		return (
			<Box className="w-full flex flex-col items-center justify-center h-[160px] gap-2">
				<IconFileText size={64} color="gray" />
				<Text size="xs" c="dimmed" ta="center">
					Text File
				</Text>
			</Box>
		);
	}

	return (
		<Box className="w-full flex items-center justify-center h-[160px]">
			<Box
				style={{
					width: "120px",
					height: "auto",
					maxHeight: "140px",
					overflow: "hidden",
					border: "1px solid #e0e0e0",
					padding: "4px",
					backgroundColor: "#fafafa",
					borderRadius: "2px",
					fontSize: "8px",
					lineHeight: "1.0",
					fontFamily: "monospace",
					whiteSpace: "pre-wrap",
					color: "#666",
					display: "-webkit-box",
					WebkitLineClamp: 16,
					WebkitBoxOrient: "vertical",
				}}
			>
				{content}
			</Box>
		</Box>
	);
}