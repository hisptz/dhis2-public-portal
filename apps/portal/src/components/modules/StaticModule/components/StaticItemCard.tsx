import { StaticItemConfig } from "@packages/shared/schemas";
import { Button, Card, Group, Text, Title } from "@mantine/core";
import Link from "next/link";

export function StaticItemCard({
	item,
	moduleId,
}: {
	item: StaticItemConfig;
	moduleId: string;
}) {
	return (
		<Card className="w-full h-full">
			<Title order={4}>{item.title}</Title>
			<Text ta="justify" size="sm" c="dimmed">
				{item.shortDescription}
			</Text>
			<Group justify="flex-end">
				<Button
					href={`${moduleId}/details/${item.id}`}
					component={Link}
					variant="subtle"
				>
					Learn more
				</Button>
			</Group>
		</Card>
	);
}
