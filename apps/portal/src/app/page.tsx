import { Button, Stack } from "@mantine/core";

export default async function Home() {
	return (
		<div className="w-full h-full flex items-center justify-center">
			<Stack>
				<h1 className="text-3xl font-bold">
					Welcome to DHIS2 Public Portal!
				</h1>
				<Button>Click me</Button>
			</Stack>
		</div>
	);
}
