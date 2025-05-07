"use client";

import type { Plugin, RenderViewer } from "@react-pdf-viewer/core";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { thumbnailPlugin } from "@react-pdf-viewer/thumbnail";
import { Loader } from "@mantine/core";
import { ReactElement } from "react";

export interface PDFVisualizerProps {
	path: string;
}

export interface PageThumbnailPluginProps {
	PageThumbnail: ReactElement;
}

const pageThumbnailPlugin = (props: PageThumbnailPluginProps): Plugin => {
	const { PageThumbnail } = props;

	return {
		renderViewer: (renderProps: RenderViewer) => {
			const { slot } = renderProps;

			slot.children = PageThumbnail;

			// Reset the sub slot
			slot!.subSlot!.attrs = {};
			slot!.subSlot!.children = <></>;

			return slot;
		},
	};
};

export function PDFVisualizer({ path }: PDFVisualizerProps) {
	const thumbnailPluginInstance = thumbnailPlugin({
		thumbnailWidth: 100,
		renderSpinner: () => {
			return (
				<div className="w-full h-full flex items-center justify-center min-h-[100px]">
					<Loader color="blue" />
				</div>
			);
		},
	});
	const { Cover } = thumbnailPluginInstance;
	const pageThumbnailPluginInstance = pageThumbnailPlugin({
		PageThumbnail: <Cover getPageIndex={() => 0} />,
	});
	return (
		<Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
			<Viewer
				plugins={[pageThumbnailPluginInstance, thumbnailPluginInstance]}
				fileUrl={path}
			></Viewer>
		</Worker>
	);
}
