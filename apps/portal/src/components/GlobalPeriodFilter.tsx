"use client";

import { Stack, TextInput, Tooltip } from "@mantine/core";
import i18n from "@dhis2/d2-i18n";
import { useBoolean } from "usehooks-ts";

import { useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PeriodConfig } from "@packages/shared/schemas";
import { CustomPeriodModal } from "@/components/displayItems/visualizations/CustomPeriodModal";
import { IconClock } from "@tabler/icons-react";
import { PeriodTypeCategory, PeriodUtility } from "@hisptz/dhis2-utils";
import { createFixedPeriodFromPeriodId } from "@dhis2/multi-calendar-dates";

export function GlobalPeriodFilter({
	periodConfig,
	title,
	isPending,
}: {
	periodConfig?: PeriodConfig;
	title?: string;
	isPending: boolean;
}) {
	const [isPendingPeriod, startPeriodTransition] = useTransition();
	const router = useRouter();
	const searchParams = useSearchParams();
	const {
		value: hide,
		setTrue: onClose,
		setFalse: onOpen,
	} = useBoolean(true);
	const periods = useMemo(() => {
		return searchParams
			.get("pe")
			?.split(",")
			?.map((id: string) => {
				const label =
					PeriodUtility.getPeriodById(id).type.type ==
					PeriodTypeCategory.FIXED
						? createFixedPeriodFromPeriodId({
								periodId: id,
								calendar: "gregory",
							})?.displayName
						: PeriodUtility.getPeriodById(id).name;
				return { value: id, label: label };
			});
	}, [searchParams]);

	const onUpdate = (value: string[]) => {
		const updateSearchParams = new URLSearchParams(searchParams);
		updateSearchParams.set("pe", value.join(","));
		startPeriodTransition(() => {
			router.replace(`?${updateSearchParams.toString()}`);
		});
	};
	const hasActiveParams = !!searchParams.get("pe");

	const onReset = () => {
		const params = new URLSearchParams(searchParams);
		params.delete("pe");
		startPeriodTransition(() => {
			router.replace(`?${params.toString()}`);
		});
	};

	return (
		<>
			<Stack>
				<div className="w-full flex gap-2">
					<Tooltip
						withArrow
						position={"bottom"}
						label={i18n.t("Click to change period")}
					>
						<TextInput
							label={"Period"}
							disabled={isPending || isPendingPeriod}
							readOnly
							rightSection={<IconClock size={16} />}
							value={
								isPending || isPendingPeriod
									? i18n.t("Please wait...")
									: (periods
											?.map((pe) => pe.label)
											.join(", ") ?? "")
							}
							onClick={onOpen}
						/>
					</Tooltip>
				</div>
			</Stack>
			{!hide && (
				<CustomPeriodModal
					{...(periodConfig ?? {})}
					periodState={periods?.map((pe) => pe.value)}
					open={!hide}
					onReset={hasActiveParams ? onReset : () => {}}
					handleClose={onClose}
					onUpdate={onUpdate}
					title={title ?? ""}
				/>
			)}
		</>
	);
}
