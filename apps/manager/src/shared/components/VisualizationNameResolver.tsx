import { useDataQuery } from "@dhis2/app-runtime";
import { CircularLoader } from "@dhis2/ui";
import React from "react";

const visQuery = {
	vis: {
		resource: "visualizations",
		id: ({ id }) => id,
		params: {
			fields: ["id", "displayName", "type"],
		},
	},
};
type Response = {
	vis: {
		id: string;
		displayName: string;
		type: string;
	};
};

export function VisualizationNameResolver({ id }: { id: string }) {
	const { data, loading, error } = useDataQuery<Response>(visQuery, {
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
	return <>{data?.vis?.displayName ?? id}</>;
}
