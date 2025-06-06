"use client";

import { Button, Center, Stack, Text, Title } from "@mantine/core";

export default function ModuleError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	console.error(error, reset);

	return (
		<Center h="98dvh">
			<Stack align="center">
				<Title order={2}>Unexpected Error</Title>
				<Text ta="center" c="dimmed">
					{error.message}
				</Text>
				<Button onClick={reset}>Refresh</Button>
			</Stack>
		</Center>
	);
}
