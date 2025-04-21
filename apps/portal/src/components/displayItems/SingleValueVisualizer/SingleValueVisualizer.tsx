//TODO: this is the national key indicators card replace it when migrating
import { SingleValueConfig } from "@packages/shared/schemas";
import { Box, Group, Image, Title } from "@mantine/core";
import NextImage from "next/image";

export function SingleValueVisualizer({
	config,
}: {
	config: SingleValueConfig;
}) {
	const imageURL = `/api/icons/${config.icon}/icon`;
	return (
		<Box className="w-full h-full">
			<Group align="center" justify="space-between">
				<Title order={2}>33.3</Title>
				<Image
					alt={config.icon}
					width={80}
					height={80}
					component={NextImage}
					src={imageURL}
				/>
			</Group>
		</Box>
	);
}
