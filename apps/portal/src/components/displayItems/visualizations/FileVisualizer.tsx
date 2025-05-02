import { LibraryFileData } from "@packages/shared/schemas";
import { IconCircleX, IconFileZip, IconScan } from "@tabler/icons-react";
import { Text } from "@mantine/core";
import { dhis2HttpClient } from "@/utils/api/dhis2";
import Link from "next/link";
import { PDFVisualizer } from "@/components/displayItems/visualizations/PDFVisualizer";

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
	const iconProps = {
		style: { fontSize: 64 },
		color: "primary",
	} as const;
	const url = `documents/${config.id}`;

	const data = await dhis2HttpClient.get<ResponseData | ErrorResponseData>(
		url,
		{
			params: {
				fields: `id,href,lastUpdated,name`,
			},
		},
	);

	const href = `/api/documents/${config.id}/data`;
	const path = `${process.env.CONTEXT_PATH}${href}`;

	if (!data) {
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
			href={href}
			target="_blank"
			referrerPolicy="no-referrer"
			style={{
				textAlign: "center",
				color: "black",
				cursor: "pointer",
				textDecoration: "none",
			}}
			className="flex flex-col items-center justify-center gap-4 text-center h-full "
		>
			{type === "PDF" && <PDFVisualizer path={path} />}
			{type === "ZIP" && <IconFileZip {...iconProps} />}
			{type === "DOC" && <IconScan {...iconProps} />}
			<b className="text-primary-500">{config?.label}</b>
		</Link>
	);
}
