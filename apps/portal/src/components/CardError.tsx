"use client";

import {
	Button,
	Container,
	Stack,
	Text,
	Title,
	useMantineTheme,
} from "@mantine/core";
import { IconExclamationCircleFilled } from "@tabler/icons-react";
import { FallbackProps } from "react-error-boundary";

export function BaseCardError({ error }: { error: Error }) {
	const theme = useMantineTheme();
	return (
		<Container
			className="w-full h-full flex flex-col justify-center items-center"
			fluid
		>
			<Stack gap="sm" align="center">
				<IconExclamationCircleFilled
					color={theme.colors[theme.primaryColor]![5]}
					opacity={0.4}
					size={36}
				/>
				<Stack align="center" gap={0}>
					<Title order={4}>Something went wrong</Title>
					<Text c="dimmed">{error.message ?? error.toString()}</Text>
				</Stack>
			</Stack>
		</Container>
	);
}

export function CardError({ error, resetErrorBoundary }: FallbackProps) {
	const theme = useMantineTheme();
	return (
		<Container
			className="w-full h-full flex flex-col justify-center items-center"
			fluid
		>
			<Stack gap="sm" align="center">
				<IconExclamationCircleFilled
					color={theme.colors[theme.primaryColor]![5]}
					opacity={0.4}
					size={36}
				/>
				<Stack align="center" gap={0}>
					<Title order={4}>Something went wrong</Title>
					<Text c="dimmed">{error.message ?? error.toString()}</Text>
				</Stack>
				<Button onClick={resetErrorBoundary}>Retry</Button>
			</Stack>
		</Container>
	);
}
