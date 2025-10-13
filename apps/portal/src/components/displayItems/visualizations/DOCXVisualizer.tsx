"use client";

import React, { useState, useEffect } from "react";
import { Box, Text, LoadingOverlay } from "@mantine/core";
import { IconFileDescription, IconCircleX } from "@tabler/icons-react";
import mammoth from "mammoth";

export interface DOCXVisualizerProps {
	path: string;
}

export function DOCXVisualizer({ path }: DOCXVisualizerProps) {
	const [content, setContent] = useState<string>("");
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadDocxContent = React.useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await fetch(path);
			
			if (!response.ok) {
				throw new Error(`Failed to load DOCX file: ${response.statusText}`);
			}

			const arrayBuffer = await response.arrayBuffer();
			
 			const result = await mammoth.convertToHtml({ arrayBuffer });
			setContent(result.value);
			
 			if (result.messages.length > 0) {
				console.log("Mammoth conversion messages:", result.messages);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load DOCX content");
			console.error("Error loading DOCX:", err);
		} finally {
			setLoading(false);
		}
	}, [path]);

	useEffect(() => {
		loadDocxContent();
	}, [loadDocxContent]);

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
				<IconCircleX size={48} color="red" />
				<Text size="xs" c="red" ta="center">
					Failed to load document
				</Text>
			</Box>
		);
	}

	if (!content) {
		return (
			<Box className="w-full flex flex-col items-center justify-center h-[160px] gap-2">
				<IconFileDescription size={64} color="#2563eb" />
				<Text size="xs" c="dimmed" ta="center">
					Word Document
				</Text>
			</Box>
		);
	}

	return (
		<Box className="w-full flex items-center justify-center h-[160px]">
			<Box
				dangerouslySetInnerHTML={{ __html: content }}
				style={{
					fontSize: "8px",
					lineHeight: "1.0",
					overflow: "hidden",
					color: "#666",
					width: "120px",
					height: "auto",
					maxHeight: "140px",
					textOverflow: "ellipsis",
					display: "-webkit-box",
					WebkitLineClamp: 16,
					WebkitBoxOrient: "vertical",
					border: "1px solid #e0e0e0",
					padding: "4px",
					backgroundColor: "#fafafa",
					borderRadius: "2px",
				}}
			/>
		</Box>
	);
}