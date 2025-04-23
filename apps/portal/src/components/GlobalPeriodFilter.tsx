"use client";

import { Button, Stack, TextInput } from "@mantine/core";
import i18n from "@dhis2/d2-i18n";
import { useBoolean } from "usehooks-ts";

import { useMemo, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PeriodConfig } from "@packages/shared/schemas";
import { CustomPeriodModal } from "@/components/displayItems/visualizations/CustomPeriodModal";

export function GlobalPeriodFilter({
	periodConfig,
	title,
}: {
	periodConfig?: PeriodConfig;
	title?: string;
}) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const searchParams = useSearchParams();
	const {
		value: hide,
		setTrue: onClose,
		setFalse: onOpen,
	} = useBoolean(true);
	const periods = useMemo(
		() => searchParams.get("pe")?.split(",") ?? [],
		[searchParams],
	);

	const onUpdate = (value: string[]) => {
		const updateSearchParams = new URLSearchParams(searchParams);
		updateSearchParams.set("pe", value.join(","));
		startTransition(() => {
			router.replace(`?${updateSearchParams.toString()}`);
		});
	};

	return (
		<div className="flex flex-wrap gap-2">
			<Stack className="form-control flex-1">
				<strong className="text-primary-400 pb-2" id={`period-label`}>
					{i18n.t("Period")}
				</strong>
				<div className="w-full flex gap-2">
					<TextInput
						disabled={isPending}
						value={periods.join(", ")}
						onClick={onOpen}
					/>
					<Button
						disabled={isPending}
						variant="outlined"
						onClick={onOpen}
					>
						{isPending
							? i18n.t("Please wait...")
							: i18n.t("Change period")}
					</Button>
				</div>
			</Stack>
			{!hide && (
				<CustomPeriodModal
					{...(periodConfig ?? {})}
					periodState={periods}
					open={!hide}
					onReset={() => {}}
					handleClose={onClose}
					onUpdate={onUpdate}
					title={title ?? ""}
				/>
			)}
		</div>
	);
}
