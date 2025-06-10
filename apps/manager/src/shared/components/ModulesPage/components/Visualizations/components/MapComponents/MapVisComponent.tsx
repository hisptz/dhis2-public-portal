import React, { RefObject, useCallback, useRef, useState } from "react";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { OrgUnitSelection } from "@hisptz/dhis2-utils";
import { Map as LeafletMap } from "leaflet";
import { useResizeObserver } from "usehooks-ts";
import { MapConfig } from "@packages/shared/schemas";
import { MapVisualizer, VisualizationTitle } from "@packages/ui/visualizations";

export function MapVisComponent({ mapConfig }: { mapConfig: MapConfig }) {
	const handler = useFullScreenHandle();
	const mapContainer = useRef<HTMLDivElement | null>(null);

	const [map, setMap] = useState<LeafletMap | null>(null);
	const mapRef = useCallback((map: LeafletMap) => {
		setMap(map);
	}, []);

	const updateMap = useCallback(() => {
		if (map) {
			map.invalidateSize();
			const bounds = map.getBounds();
			if (bounds) {
				map.fitBounds(bounds);
				map.panInsideBounds(bounds);
			}
		}
	}, [map]);

	useResizeObserver({
		ref: mapContainer as unknown as RefObject<HTMLDivElement>,
		onResize: () => {
			updateMap();
		},
	});

	const [periodState] = useState<string[] | undefined>();
	const [orgUnitSelectionState] = useState<OrgUnitSelection | undefined>();

	return (
		<>
			<FullScreen
				onChange={() => {
					updateMap();
				}}
				className="bg-white w-full h-full"
				handle={handler}
			>
				<div className="flex flex-col gap-2 p-4  w-full h-full ">
					<div className="flex flex-row place-content-between">
						<VisualizationTitle title={mapConfig.name} />
					</div>
					<div ref={mapContainer} className="flex-1 h-full">
						<MapVisualizer
							mapConfig={mapConfig}
							setRef={mapRef}
							orgUnitSelection={orgUnitSelectionState}
							periodSelection={
								periodState
									? {
											periods: periodState,
										}
									: undefined
							}
						/>
					</div>
				</div>
			</FullScreen>
		</>
	);
}
