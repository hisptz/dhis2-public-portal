import { FooterLinksConfig } from "@packages/shared/schemas";
import { Group, List, Title, useMantineTheme } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";

export function FooterLinks({ config }: { config: FooterLinksConfig }) {
	const { links, title } = config ?? {};
	const theme = useMantineTheme();
	return (
		<div className="min-w-[200px]">
			<Title order={5}>{title}</Title>
			<List>
				{links.map((link) => (
					<List.Item c={theme.primaryColor} key={link.url}>
						<a href={link.url} target="_blank">
							<Group align="center" gap={4}>
								{link.name}
								<IconExternalLink size={14} />
							</Group>
						</a>
					</List.Item>
				))}
			</List>
		</div>
	);
}
