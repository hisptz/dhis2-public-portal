"use client";

import { Anchor, Button, Center, Container, Stack, Text, Title } from "@mantine/core";
import Link from "next/link";

export function NoConfigLandingPage() {
	return (
		<Container className="h-full" fluid>
			<Center h="100%">
				<Stack align="center">
					<Title order={2}>No configuration found</Title>
					<Text ta="center" c="dimmed">
						There are no configuration found in the connected DHIS2
						instance.
						<br />
						Please contact your administrator. If you are the
						administrator, please visit the{" "}
						<Anchor
							component={Link}
							target="_blank"
							rel="noreferrer"
							href={
								"https://hisptz.github.io/dhis2-public-portal/docs/configuration/intro"
							}
						>
							documentation
						</Anchor>
					</Text>
					<Button component={Link} href={"/"}>
						Refresh
					</Button>
				</Stack>
			</Center>
		</Container>
	);
}
