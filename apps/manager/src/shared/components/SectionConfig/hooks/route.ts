import { useParams } from "@tanstack/react-router";

export function useSectionNamePrefix() {
	const { sectionIndex } = useParams({
		from: "/modules/_provider/$moduleId/_formProvider/edit/section/$sectionIndex/",
	});
	return `config.sections.${sectionIndex}` as const;
}
