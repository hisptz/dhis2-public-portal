"use client";

import { useSearchParams } from "next/navigation";
import { OrgUnitConfig } from "@packages/shared/schemas";
import { Stack, TextInput, Tooltip } from "@mantine/core";
import { useBoolean } from "usehooks-ts";
import i18n from "@dhis2/d2-i18n";
import { useMemo, useTransition } from "react";
import { useOrgUnit } from "@/utils/orgUnits";
import { OrganisationUnit } from "@hisptz/dhis2-utils";
import { IconMapPin } from "@tabler/icons-react";
import { useRouter } from "nextjs-toploader/app";
import { CustomOrgUnitModal } from "@/components/displayItems/visualizations/CustomOrgUnitModal";

export function GlobalOrgUnitFilter({
	orgUnitConfig,
	title,
	isPending,
}: {
	orgUnitConfig?: OrgUnitConfig;
	title: string;
	isPending: boolean;
}) {
	const [isPendingOrgUnit, startOrgUnitTransition] = useTransition();
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
		startOrgUnitTransition(() => {
			router.replace(`?${updateSearchParams.toString()}`);
		});
	};

	const hasActiveParams = !!searchParams.get("ou");

	const onReset = () => {
		const params = new URLSearchParams(searchParams);
		params.delete("ou");
		startOrgUnitTransition(() => {
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
						label={i18n.t("Click to change location")}
					>
						<TextInput
							onClick={onOpen}
							readOnly
							label={i18n.t("Location")}
							disabled={isPending || isPendingOrgUnit || loading}
							rightSection={<IconMapPin size={16} />}
							value={
								isPending || isPendingOrgUnit
									? i18n.t("Please wait...")
									: loading
										? i18n.t("Loading...")
										: orgUnit
												?.map(
													(ou: OrganisationUnit) =>
														ou.name ??
														ou.displayName,
												)
												.join(", ")
							}
						/>
					</Tooltip>
				</div>
			</Stack>
			{!hide && (
				<CustomOrgUnitModal
					onReset={hasActiveParams ? onReset : () => {}}
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
