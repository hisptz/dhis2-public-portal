"use client";

import { Card, Group } from "@mantine/core";
import { GlobalOrgUnitFilter } from "@/components/GlobalOrgUnitFilter";
import { GlobalPeriodFilter } from "@/components/GlobalPeriodFilter";
import { VisualizationModuleConfig } from "@packages/shared/schemas";
import { useSearchParams } from "next/navigation";
import { ResetDimensionButton } from "@/components/modules/VisualizationModule/components/ResetDimensionButton";
import { useTransition } from "react";

export function Selectors({ config }: { config: VisualizationModuleConfig }) {
	const searchParams = useSearchParams();
	const [isPending, startTransition] = useTransition();
	const currentGroup = searchParams.get("group");
	const currentSelectedGroup = config.grouped
		? config.groups.find((group) => group.id == currentGroup)
		: config;

	return (
		<Card className="w-full">
			<Group justify={"space-between"} align={"flex-start"}>
				<Group>
					<GlobalOrgUnitFilter
						title={currentSelectedGroup?.title ?? ""}
						orgUnitConfig={currentSelectedGroup?.orgUnitConfig}
						isPending={isPending}
					/>
					<GlobalPeriodFilter
						title={currentSelectedGroup?.title}
						periodConfig={currentSelectedGroup?.periodConfig}
						isPending={isPending}
					/>
				</Group>
				<ResetDimensionButton
					startTransition={startTransition}
					isPending={isPending}
				/>
			</Group>
		</Card>
	);
}
