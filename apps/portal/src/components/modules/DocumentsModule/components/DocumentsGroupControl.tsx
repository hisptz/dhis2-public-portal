"use client";

import { GroupedDocumentModuleConfig } from "@packages/shared/schemas";
import { Box, SegmentedControl } from "@mantine/core";
import { redirect, usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";

export function DocumentsGroupControl({
	config,
}: {
	config: GroupedDocumentModuleConfig;
}) {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();

	const groupId = searchParams.get("group");
	const groups = config.groups;

	if (groupId == null) {
		const params = new URLSearchParams(searchParams);
		params.set("group", groups[0].id);
		redirect(`${pathname}?${params.toString()}`);
	}

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
