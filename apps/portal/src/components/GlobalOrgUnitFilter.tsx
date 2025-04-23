"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { OrgUnitConfig } from "@packages/shared/schemas";
import { Button, Stack, TextInput } from "@mantine/core";
import { useBoolean } from "usehooks-ts";
import i18n from "@dhis2/d2-i18n";
import { useMemo, useTransition } from "react";
import { useOrgUnit } from "@/utils/orgUnits";
import { OrganisationUnit } from "@hisptz/dhis2-utils";
import { CustomOrgUnitModal } from "@/components/displayItems/visualizations/CustomOrgUnitModal";

export function GlobalOrgUnitFilter({
	orgUnitConfig,
	title,
}: {
	orgUnitConfig?: OrgUnitConfig;
	title: string;
}) {
	const [isPending, startTransition] = useTransition();
	const searchParams = useSearchParams();
	const orgUnits = useMemo(
		() => searchParams.get("ou")?.split(",") ?? [],
		[searchParams.get("ou")],
	);
	const { loading, orgUnit } = useOrgUnit(orgUnits);
	const router = useRouter();
	const {
		value: hide,
		setTrue: onClose,
		setFalse: onOpen,
	} = useBoolean(true);

	const onUpdate = (value: string[] | undefined) => {
		const updateSearchParams = new URLSearchParams(searchParams);
		updateSearchParams.set("ou", value?.join(",") ?? "");
		startTransition(() => {
			router.replace(`?${updateSearchParams.toString()}`);
		});
	};

	return (
		<>
			<Stack>
				<strong className="text-primary-400 pb-2" id={`period-label`}>
					{i18n.t("Location")}
				</strong>
				<div className="w-full flex gap-2">
					<TextInput
						onClick={onOpen}
						disabled={isPending}
						value={
							loading
								? i18n.t("Loading...")
								: orgUnit
										?.map(
											(ou: OrganisationUnit) =>
												ou.name ?? ou.displayName,
										)
										.join(", ")
						}
					/>
					<Button
						disabled={isPending}
						variant="outlined"
						onClick={onOpen}
					>
						{isPending
							? i18n.t("Please wait...")
							: i18n.t("Change location")}
					</Button>
				</div>
			</Stack>
			{!hide && (
				<CustomOrgUnitModal
					onReset={() => {}}
					orgUnitState={orgUnits}
					onUpdate={onUpdate}
					open={!hide}
					title={title}
					handleClose={onClose}
					limitSelectionToLevels={orgUnitConfig?.orgUnitLevels}
					orgUnitsId={orgUnitConfig?.orgUnits}
				/>
			)}
		</>
	);
}
