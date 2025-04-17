import { Center, Container, Text, Title } from "@mantine/core";

export function NoConfigLandingPage() {
	return (
		<Container>
			<Center>
				<Title order={2}>No configuration found</Title>
				<Text c="dimmed">
					There are no configuration found in the connected DHIS2
					instance.
					<br />
					Please contact your administrator.
				</Text>
			</Center>
		</Container>
	);
}
