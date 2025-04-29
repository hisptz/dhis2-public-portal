import { Title } from "@mantine/core";

export function PageTitle({ title }: { title: string }) {
	return <Title order={2}>{title}</Title>;
}
