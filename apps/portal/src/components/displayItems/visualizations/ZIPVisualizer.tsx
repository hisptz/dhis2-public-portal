"use client";

import React, { useState, useEffect } from "react";
import { Box, Text, LoadingOverlay, List } from "@mantine/core";
import { IconFileZip, IconCircleX, IconFile, IconFolder } from "@tabler/icons-react";
import JSZip from "jszip";

export interface ZIPVisualizerProps {
	path: string;
}

export function ZIPVisualizer({ path }: ZIPVisualizerProps) {
	const [files, setFiles] = useState<Array<{ name: string; isFolder: boolean }>>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadZipContent = React.useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await fetch(path);
			
			if (!response.ok) {
				throw new Error(`Failed to load ZIP file: ${response.statusText}`);
			}

			const arrayBuffer = await response.arrayBuffer();
			
 			const zip = new JSZip();
			const zipData = await zip.loadAsync(arrayBuffer);
			
 			const fileList: Array<{ name: string; isFolder: boolean }> = [];
			let count = 0;
			
			zipData.forEach((relativePath, file) => {
				if (count >= 8) return;  
				
				const isFolder = file.dir;
				const displayName = relativePath.length > 25 
					? "..." + relativePath.slice(-22) 
					: relativePath;
					
				fileList.push({
					name: displayName,
					isFolder
				});
				count++;
			});
			
			setFiles(fileList);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load ZIP content");
			console.error("Error loading ZIP:", err);
		} finally {
			setLoading(false);
		}
	}, [path]);

	useEffect(() => {
		loadZipContent();
	}, [loadZipContent]);

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
					Failed to load archive
				</Text>
			</Box>
		);
	}

	if (!files || files.length === 0) {
		return (
			<Box className="w-full flex flex-col items-center justify-center h-[160px] gap-2">
				<IconFileZip size={64} color="#f59e0b" />
				<Text size="xs" c="dimmed" ta="center">
					ZIP Archive
				</Text>
			</Box>
		);
	}

	return (
		<Box className="w-full flex items-center justify-center h-[160px] p-2">
			<List
				size="xs"
				spacing={1}
				style={{
					fontSize: "9px",
					lineHeight: "1.1",
					maxHeight: "140px",
					overflow: "hidden",
				}}
			>
				{files.map((file, index) => (
					<List.Item
						key={index}
						icon={
							file.isFolder ? 
							<IconFolder size={12} color="#3b82f6" /> : 
							<IconFile size={12} color="#6b7280" />
						}
						style={{
							color: "#666",
							padding: "1px 0",
						}}
					>
						<Text size="xs" truncate>
							{file.name}
						</Text>
					</List.Item>
				))}
			</List>
		</Box>
	);
}