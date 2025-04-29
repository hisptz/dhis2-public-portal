"use client";

import dynamic from "next/dynamic";
import { Loader } from "@mantine/core";

import { MapProps } from "@hisptz/dhis2-analytics";
import { useRouter, useSearchParams } from "next/navigation";
import { memo, useCallback, useMemo } from "react";
import { isEmpty } from "lodash";
import { OrgUnitSelection } from "@hisptz/dhis2-utils";
import { Map as LeafletMap } from "leaflet";

export interface MapViewProps extends MapProps {
	setRef: (map: LeafletMap) => void;
}

const NoSsrDHIS2Map = dynamic(
	() =>
		import("@hisptz/dhis2-analytics").then(({ DHIS2Map }) => ({
			default: memo(DHIS2Map),
		})),
	{
		ssr: false,
		loading: () => {
			return (
				<div className="w-full h-full flex items-center justify-center min-h-[500px]">
					<Loader color="blue" />
				</div>
			);
		},
	},
);

export function MapView(props: MapViewProps) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const orgUnits = useMemo(
		() => searchParams.get("ou")?.split(",") ?? [],
		[searchParams],
	);

	const activeOrgUnitSelection = useMemo(() => {
		if (isEmpty(orgUnits)) {
			return props.orgUnitSelection;
		} else {
			const orgUnitSelection: OrgUnitSelection = {
				levels: [],
				orgUnits: [],
			};
			orgUnits.forEach((orgUnit) => {
				if (orgUnit.includes("LEVEL")) {
					orgUnitSelection.levels!.push(
						orgUnit.replace("LEVEL-", ""),
					);
				} else {
					orgUnitSelection.orgUnits!.push({
						id: orgUnit,
						path: orgUnit,
						children: [],
					});
				}
			});
			return orgUnitSelection;
		}
	}, [orgUnits, props.orgUnitSelection]);

	const onLayerClick = useCallback(
		(_: unknown, data: any) => {
			const orgUnit = data.orgUnit;
			if (orgUnit.level < 3) {
				const params = new URLSearchParams(searchParams);
				params.set(
					"ou",
					`${data.orgUnit.id},LEVEL-${data.orgUnit.level + 1}`,
				);
				router.replace(`?${params.toString()}`);
			}
		},
		[router, searchParams],
	);

	const updatedThematicLayers =
		props.thematicLayers?.map((layer) => ({
			...layer,
			onLayerClick,
		})) ?? [];

	return (
		<NoSsrDHIS2Map
			{...props}
			setRef={props.setRef}
			orgUnitSelection={activeOrgUnitSelection}
			thematicLayers={updatedThematicLayers}
			analyticsOptions={{
				displayProperty: "SHORTNAME",
			}}
		/>
	);
}
