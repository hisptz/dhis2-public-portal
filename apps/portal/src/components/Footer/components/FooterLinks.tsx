import { FooterLinksConfig } from "@packages/shared/schemas";
import { Text, Title, useMantineTheme } from "@mantine/core";

export function FooterLinks({ config }: { config: FooterLinksConfig }) {
	const { links, title } = config ?? {};
	const theme = useMantineTheme();
	return (
		<div className="min-w-[200px]">
			<Title order={5}>{title}</Title>
			{links.map((link) => (
				<Text
					c={theme.primaryColor}
					target="_blank"
					key={link.url}
					href={link.url}
					component="a"
				>
					{link.name}
				</Text>
			))}
		</div>
	);
}
