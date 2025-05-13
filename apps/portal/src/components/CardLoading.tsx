import { Box, Loader } from "@mantine/core";

export function CardLoading() {
	return (
		<Box className="w-full h-full flex flex-col items-center justify-center">
			<Loader size="md" />
		</Box>
	);
}
