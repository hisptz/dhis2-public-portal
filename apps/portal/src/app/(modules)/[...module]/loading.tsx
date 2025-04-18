"use client";

import { Box, Loader } from "@mantine/core";

export default function ModuleLoading() {
	return (
		<Box
			style={{
				height: "calc(100dvh - 400px)",
			}}
			className="w-full flex items-center justify-center"
		>
			<Loader />
		</Box>
	);
}
