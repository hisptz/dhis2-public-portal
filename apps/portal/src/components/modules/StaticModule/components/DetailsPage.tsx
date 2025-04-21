import { Card, Container, Title } from "@mantine/core";
import { getAppModule } from "@/utils/module";
import { ModuleType, StaticItemConfig } from "@packages/shared/schemas";
import { getAppConfigWithNamespace } from "@/utils/config";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { BaseCardError } from "@/components/CardError";
import { RichContent } from "@/components/RichContent";

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
			<Title order={2}>{item.title}</Title>
			<Card>
				<RichContent content={item.content} />
			</Card>
		</Container>
	);
}
