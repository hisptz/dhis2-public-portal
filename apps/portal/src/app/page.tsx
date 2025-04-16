import { Button, Stack } from "@mantine/core";

export default async function Home() {
	// await new Promise((resolve) => setTimeout(resolve, 100000));

	return (
		<Stack>
			<h1 className="text-3xl font-bold">
				Welcome to DHIS2 Public Portal!
			</h1>
			<Button>Click me</Button>
		</Stack>
	);
}
