"use client";

import {
	Box,
	Button,
	Container,
	Group,
	mantineHtmlProps,
	MantineProvider,
	Stack,
	Text,
	Title,
} from "@mantine/core";

export default function GlobalError() {
	return (
		<html {...mantineHtmlProps}>
			<MantineProvider>
				<body>
					<Container
						fluid
						className="h-screen flex flex-col justify-center items-center"
					>
						<Box>
							<Text
								fw={700}
								c="blue"
								style={{
									fontSize: "16rem",
									margin: 0,
								}}
								className="opacity-40"
							>
								500
							</Text>
						</Box>
						<Box className="w-[40%] z-10">
							<Stack align="center">
								<Title>Unexpected Application Error</Title>
								<Text c="dimmed" size="lg" ta="center">
									We apologize, but something went wrong with
									the application. Please try again later. If
									the problem persists, contact your system
									administrator.
								</Text>
								<Group justify="center">
									<Button
										onClick={() => {
											window.location.reload();
										}}
										size="md"
									>
										Refresh
									</Button>
								</Group>
							</Stack>
						</Box>
					</Container>
				</body>
			</MantineProvider>
		</html>
	);
}
