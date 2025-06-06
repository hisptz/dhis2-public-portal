import {
	Box,
	Button,
	ColorSchemeScript,
	Container,
	Group,
	mantineHtmlProps,
	MantineProvider,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import Link from "next/link";
import { ConnectionErrorStatus } from "@/types/connection";

export function DHIS2ConnectionError({
	error,
}: {
	error: ConnectionErrorStatus;
}) {
	return (
		<html {...mantineHtmlProps}>
			<head>
				<ColorSchemeScript />
			</head>
			<body>
				<MantineProvider>
					<Notifications />
					<Container
						fluid
						className="h-screen flex flex-col justify-center items-center"
					>
						<Box className="w-[40%] z-10">
							<Stack align="center">
								<Title>{error.title}</Title>
								<Text c="dimmed" size="lg" ta="center">
									{error.message}
								</Text>
								<Group justify="center">
									<Button
										component={Link}
										href={"/"}
										size="md"
									>
										Refresh
									</Button>
								</Group>
							</Stack>
						</Box>
					</Container>
				</MantineProvider>
			</body>
		</html>
	);
}
