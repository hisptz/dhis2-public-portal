import { Button, Card, Container, Stack, Title } from "@mantine/core";
import { getAppModule } from "@/utils/module";
import { ModuleType, StaticItemConfig } from "@packages/shared/schemas";
import { getAppConfigWithNamespace } from "@/utils/config";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { BaseCardError } from "@/components/CardError";
import { RichContent } from "@/components/RichContent";
import { IconArrowLeft } from "@tabler/icons-react";
import Link from "next/link";

export async function DetailsPage({
	id,
	moduleId,
}: {
	id: string;
	moduleId: string;
}) {
	const config = await getAppModule(moduleId);

	if (!config || config.type !== ModuleType.STATIC) {
		return (
			<BaseCardError
				error={new Error("Could not determine what to show")}
			/>
		);
	}

	const namespace = config.config.namespace;

	const item = await getAppConfigWithNamespace<StaticItemConfig>({
		namespace: namespace as DatastoreNamespaces,
		key: id,
	});

	if (!item) {
		return <BaseCardError error={new Error("Item not found")} />;
	}

	return (
		<Container fluid px={0}>
			<Stack align="flex-start">
				<Button
					variant="subtle"
					href={"../"}
					component={Link}
					leftSection={<IconArrowLeft size={14} />}
				>
					Back
				</Button>
				<Title order={2}>{item.title}</Title>
				<Card>
					<RichContent content={item.content} />
				</Card>
			</Stack>
		</Container>
	);
}
