import { LibraryFileData } from "@packages/shared/schemas";
import { IconCircleX } from "@tabler/icons-react";
import { Box, Text } from "@mantine/core";
import { dhis2HttpClient } from "@/utils/api/dhis2";
import Link from "next/link";
import { getServerImageUrl } from "@/utils/server/images";
import { PDFVisualizer } from "@/components/displayItems/visualizations/PDFVisualizer";
 import { XLSXVisualizer } from "@/components/displayItems/visualizations/XLSXVisualizer";
import { ZIPVisualizer } from "@/components/displayItems/visualizations/ZIPVisualizer";
import { TXTVisualizer } from "@/components/displayItems/visualizations/TXTVisualizer";
import { env } from "@/utils/env";
import { DOCXVisualizer } from "./DOCXVisualizer";

export interface PDFVisualizerProps {
	config: LibraryFileData;
}

interface ResponseData {
	id: string;
	href: string;
	name: string;
	lastUpdated: string;
}

interface ErrorResponseData {
	status: number;
	message: string;
	name: string;
}

export async function FileVisualizer({ config }: PDFVisualizerProps) {
	const type = config.type;
	const url = `documents/${config.id}`;

	const data = await dhis2HttpClient.get<ResponseData | ErrorResponseData>(
		url,
		{
			params: {
				fields: `id,href,lastUpdated,name`,
			},
		},
	);

	const href = getServerImageUrl(config.id);

	if (!data || !href) {
		return (
			<div className="flex flex-col gap-4 justify-center items-center text-center h-full">
				<IconCircleX color="error" fontSize="medium" />
				<Text c="red.6" fz="sm">
					Could not get data
				</Text>
			</div>
		);
	}

	if ("status" in data) {
		return (
			<div className="flex flex-col gap-4 justify-center items-center text-center h-full">
				<IconCircleX color="error" fontSize="medium" />
				<Text c="red.6" fz="sm">
					{data.message}
				</Text>
			</div>
		);
	}

	return (
		<Link
			href={href.replace(env.CONTEXT_PATH ?? "", "")}
			target="_blank"
			referrerPolicy="no-referrer"
			style={{
				textAlign: "center",
				color: "black",
				cursor: "pointer",
				textDecoration: "none",
			}}
			className="flex flex-col items-center justify-center gap-2 text-center h-full w-full"
		>
			<Box className="flex flex-col items-center justify-center" flex={1}>
				{type === "PDF" && <PDFVisualizer path={href} />}
				{type === "DOCX" && <DOCXVisualizer path={href} />}
				{type === "ZIP" && <ZIPVisualizer path={href} />}
				{type === "XLSX" && <XLSXVisualizer path={href} />}
				{type === "TXT" && <TXTVisualizer path={href} />}
			</Box>
			<b className="text-primary-500">{config?.label}</b>
		</Link>
	);
}
