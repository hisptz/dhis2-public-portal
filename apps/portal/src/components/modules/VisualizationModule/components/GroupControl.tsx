"use client";

import { GroupedVisualizationModuleConfig } from "@packages/shared/schemas";
import { Box, SegmentedControl } from "@mantine/core";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";

export function GroupControl({
	config,
}: {
	config: GroupedVisualizationModuleConfig;
}) {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();

	const groupId = searchParams.get("group");
	const groups = config.groups;

	const options = groups.map((group) => ({
		label: group.title,
		value: group.id,
	}));

	const onGroupChange = (value: string) => {
		const params = new URLSearchParams(searchParams);
		params.set("group", value);
		router.replace(`${pathname}?${params.toString()}`);
	};

	return (
		<Box className="">
			<SegmentedControl
				className="md:min-w-[50%] min-w-full"
				onChange={onGroupChange}
				value={groupId ?? undefined}
				data={options}
			/>
		</Box>
	);
}
