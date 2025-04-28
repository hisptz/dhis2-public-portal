"use client";

import {
	GroupedDocumentModuleConfig,
	ItemsDisplay,
} from "@packages/shared/schemas";
import { Box, Group, SegmentedControl, Select } from "@mantine/core";
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

	const onGroupChange = (value: string | null) => {
		const params = new URLSearchParams(searchParams);
		if (value) {
			params.set("group", value);
			router.replace(`${pathname}?${params.toString()}`);
		}
	};

	if (config.itemsDisplay == ItemsDisplay.DROPDOWN) {
		return (
			<Group>
				<Select
					className="md:min-w-[20%] min-w-full"
					allowDeselect={false}
					placeholder="Pick one"
					nothingFoundMessage="Nothing found"
					data={options}
					onChange={onGroupChange}
					defaultValue={groupId ?? undefined}
				/>
			</Group>
		);
	}

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
