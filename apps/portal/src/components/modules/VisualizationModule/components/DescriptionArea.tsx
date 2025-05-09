"use client";

import { VisualizationModuleConfig } from "@packages/shared/schemas";
import { RichContent } from "@/components/RichContent";
import { Button, Card, Group, Title } from "@mantine/core";
import { modals } from "@mantine/modals";

export function DescriptionArea({
	config,
	searchParams,
}: {
	config: VisualizationModuleConfig;
	searchParams: { group?: string };
}) {
	const onShowDescription = ({
		title,
		description,
	}: {
		title: string;
		description: string;
	}) => {
		modals.open({
			id: "description",
			title,
			size: "xl",
			centered: true,
			withCloseButton: true,
			children: <RichContent content={description} />,
		});
	};

	if (config.grouped) {
		const group = config.groups.find(({ id }) => id === searchParams.group);
		if (!group) {
			return null;
		}
		if (!group.shortDescription) {
			return null;
		}
		return (
			<Card className="w-full">
				<Title order={4}>{group.title}</Title>
				<RichContent content={group.shortDescription} />
				<Group justify="flex-end">
					{group.description && (
						<Button
							onClick={() => {
								onShowDescription({
									title: group.title,
									description: group.description!,
								});
							}}
							variant="subtle"
						>
							Show more
						</Button>
					)}
				</Group>
			</Card>
		);
	}

	if (!config.shortDescription) {
		return null;
	}

	return (
		<Card className="w-full">
			<Title order={4}>{config.title}</Title>
			<RichContent content={config.shortDescription} />
			<Group justify="flex-end">
				{config.description && (
					<Button
						onClick={() => {
							onShowDescription({
								title: config.title,
								description: config.description!,
							});
						}}
						variant="subtle"
					>
						Show more
					</Button>
				)}
			</Group>
		</Card>
	);
}
