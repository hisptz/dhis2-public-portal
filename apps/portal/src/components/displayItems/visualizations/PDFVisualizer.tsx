"use client";

import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { Box, LoadingOverlay } from "@mantine/core";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@5.2.133/build/pdf.worker.min.mjs`;

export interface PDFVisualizerProps {
	path: string;
}

export function PDFVisualizer({ path }: PDFVisualizerProps) {
	const [loading, setLoading] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	const renderThumbnail = async () => {
		if (canvasRef.current === null) return;
		setLoading(true);
		const loadingTask = pdfjsLib.getDocument(path);
		const pdf = await loadingTask.promise;
		const page = await pdf.getPage(1);
		const viewport = page.getViewport({ scale: 1 });
		const scale = 120 / viewport.width;
		const scaledViewport = page.getViewport({ scale });
		setLoading(false);
		const canvas = canvasRef.current!;
		const context = canvas.getContext("2d");
		canvas.height = scaledViewport.height;
		canvas.width = scaledViewport.width;
		await page.render({
			canvasContext: context!,
			viewport: scaledViewport,
		}).promise;
	};

	useEffect(() => {
		renderThumbnail();
	}, [path]);

	return (
		<Box className="w-full flex items-center justify-center h-[160px]">
			<LoadingOverlay
				visible={loading}
				zIndex={1000}
				loaderProps={{
					size: "sm",
				}}
				overlayProps={{ radius: "sm", blur: 2 }}
			/>
			<canvas ref={canvasRef} />
		</Box>
	);
}
