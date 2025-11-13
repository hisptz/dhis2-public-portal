"use client";

import React, { useState, useEffect } from "react";
import { Box, Text, LoadingOverlay, Table } from "@mantine/core";
import { IconFileSpreadsheet, IconCircleX } from "@tabler/icons-react";
import * as XLSX from "xlsx";

export interface XLSXVisualizerProps {
	path: string;
}

export function XLSXVisualizer({ path }: XLSXVisualizerProps) {
	const [data, setData] = useState<string[][]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const loadXlsxContent = React.useCallback(async () => {
		try {
			setLoading(true);
			setError(null);

			const response = await fetch(path);
			
			if (!response.ok) {
				throw new Error(`Failed to load XLSX file: ${response.statusText}`);
			}

			const arrayBuffer = await response.arrayBuffer();
			
 			const workbook = XLSX.read(arrayBuffer, { type: 'array' });
			
 			const firstSheetName = workbook.SheetNames[0];
			if (!firstSheetName) {
				throw new Error("No sheets found in the Excel file");
			}
			
			const worksheet = workbook.Sheets[firstSheetName];
			
 			const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
				header: 1,
				range: "A1:E6"  
			}) as string[][];
			
			setData(jsonData.filter(row => row.length > 0));  
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load XLSX content");
			console.error("Error loading XLSX:", err);
		} finally {
			setLoading(false);
		}
	}, [path]);

	useEffect(() => {
		loadXlsxContent();
	}, [loadXlsxContent]);

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
					Failed to load spreadsheet
				</Text>
			</Box>
		);
	}

	if (!data || data.length === 0) {
		return (
			<Box className="w-full flex flex-col items-center justify-center h-[160px] gap-2">
				<IconFileSpreadsheet size={64} color="#16a34a" />
				<Text size="xs" c="dimmed" ta="center">
					Excel Spreadsheet
				</Text>
			</Box>
		);
	}

	return (
		<Box className="w-full flex items-center justify-center h-[160px]">
			<Table
				withTableBorder
				withColumnBorders
				style={{ 
					fontSize: "7px",
					lineHeight: "1.0",
					width: "120px",
					maxHeight: "140px",
					backgroundColor: "#fafafa",
					border: "1px solid #e0e0e0",
					borderRadius: "2px",
				}}
			>
				<Table.Tbody>
					{data.map((row, rowIndex) => (
						<Table.Tr key={rowIndex} style={{ height: "16px" }}>
							{row.map((cell, cellIndex) => (
								<Table.Td key={cellIndex} style={{ 
									padding: "1px 2px",
									maxWidth: "24px",
									overflow: "hidden",
									textOverflow: "ellipsis",
									whiteSpace: "nowrap",
									fontSize: "6px",
								}}>
									{String(cell || "")}
								</Table.Td>
							))}
						</Table.Tr>
					))}
				</Table.Tbody>
			</Table>
		</Box>
	);
}