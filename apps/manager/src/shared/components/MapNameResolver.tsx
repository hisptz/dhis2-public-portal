import { useDataQuery } from "@dhis2/app-runtime";
import { CircularLoader } from "@dhis2/ui";
import React from "react";

const mapQuery = {
	map: {
		resource: "maps",
		id: ({ id }) => id,
		params: {
			fields: ["id", "displayName"],
		},
	},
};
type Response = {
	map: {
		id: string;
		displayName: string;
		type: string;
	};
};

export function MapNameResolver({ id }: { id: string }) {
	const { data, loading, error } = useDataQuery<Response>(mapQuery, {
		variables: {
			id,
		},
	});

	if (loading) {
		return <CircularLoader extrasmall />;
	}
	if (error) {
		return <>{id}</>;
	}
	return <>{data?.map?.displayName ?? id}</>;
}
