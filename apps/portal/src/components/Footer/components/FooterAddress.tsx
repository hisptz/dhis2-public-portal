import { AddressConfig } from "@packages/shared/schemas";
import { Title } from "@mantine/core";

export function FooterAddress({ config }: { config: AddressConfig }) {
	const content = config?.content;

	return (
		<div>
			<Title order={5}>Contacts</Title>
			<div>
				Ministry of Health Idara Kuu ya Afya Mji wa Serikali/ Mtumba
				Barabara ya Afya S.L.P 743 40478 Dodoma, Tanzania Tel: +255 22
				2342000/5 Email: ps@afya.go.tz
			</div>
		</div>
	);
}
