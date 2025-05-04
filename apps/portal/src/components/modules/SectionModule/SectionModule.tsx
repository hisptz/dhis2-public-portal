import { SectionModuleConfig } from "@packages/shared/schemas";
import { Stack } from "@mantine/core";
import { SectionTitle } from "@/components/modules/SectionModule/components/SectionTitle";
import { SectionDisplaySelector } from "@/components/modules/SectionModule/components/SectionDisplaySelector";

export function SectionModule({ config }: { config: SectionModuleConfig }) {
	return (
		<Stack gap="md">
			{config.config.sections.map((section) => {
				return (
					<Stack gap="md" key={section.id}>
						<SectionTitle section={section} />
						<SectionDisplaySelector section={section} />
					</Stack>
				);
			})}
		</Stack>
	);
}
