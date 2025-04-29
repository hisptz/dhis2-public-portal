import { useParams } from "@tanstack/react-router";

export function useGroupNamePrefix() {
	const { groupIndex } = useParams({
		from: "/modules/_provider/$moduleId/_formProvider/edit/$groupIndex/",
	});
	return `config.groups.${groupIndex}` as const;
}
