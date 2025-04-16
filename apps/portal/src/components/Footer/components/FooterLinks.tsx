import { FooterLinksConfig } from "@packages/shared/schemas";
import { Text, Title } from "@mantine/core";

export function FooterLinks({ config }: { config: FooterLinksConfig }) {
	const { links, title } = config ?? {};
	return (
		<div className="min-w-[200px]">
			<Title order={5}>{title}</Title>
			{links.map((link) => (
				<Text
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
