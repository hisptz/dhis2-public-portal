"use client";

import { Card, Group } from "@mantine/core";
import { GlobalOrgUnitFilter } from "@/components/GlobalOrgUnitFilter";
import { GlobalPeriodFilter } from "@/components/GlobalPeriodFilter";
import { ResetDimensionButton } from "@/components/modules/VisualizationModule/components/ResetDimensionButton";
import { VisualizationModuleConfig } from "@packages/shared/schemas";
import { useSearchParams } from "next/navigation";

export function Selectors({ config }: { config: VisualizationModuleConfig }) {
	const searchParams = useSearchParams();
	const currentGroup = searchParams.get("group");
	const currentSelectedGroup = config.grouped
		? config.groups.find((group) => group.id == currentGroup)
		: config;
	return (
		<Card className="w-full">
			<Group>
				<GlobalOrgUnitFilter
					title={currentSelectedGroup?.title ?? ""}
					orgUnitConfig={currentSelectedGroup?.orgUnitConfig}
				/>
				<GlobalPeriodFilter
					title={currentSelectedGroup?.title}
					periodConfig={currentSelectedGroup?.periodConfig}
				/>
				<ResetDimensionButton />
			</Group>
		</Card>
	);
}
