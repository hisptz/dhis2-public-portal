import { Section, SectionType } from "@packages/shared/schemas";
import { FlexibleLayoutSection } from "@/components/modules/SectionModule/components/FlexibleLayoutSection";
import { GridSection } from "@/components/modules/SectionModule/components/GridSection";
import { SingleItemSection } from "@/components/modules/SectionModule/components/SingleItemSection";

export function SectionDisplaySelector({ section }: { section: Section }) {
	switch (section.type) {
		case SectionType.FLEXIBLE_LAYOUT:
			return <FlexibleLayoutSection config={section} />;
		case SectionType.GRID_LAYOUT:
			return <GridSection config={section} />;
		case SectionType.SINGLE_ITEM:
			return <SingleItemSection config={section} />;
		default:
			return <div>Section type not supported</div>;
	}
}
