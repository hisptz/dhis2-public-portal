import React, { useMemo } from "react";
import { useDataQuery } from "@dhis2/app-runtime";
import { RHFSingleSelectField } from "@hisptz/dhis2-ui";
import { SingleSelectFieldProps } from "@dhis2/ui";
import { RHFFieldProps } from "@hisptz/dhis2-ui/dist/types/forms/interfaces";

export type RHFOptionSetSelectFieldProps = RHFFieldProps &
	Omit<SingleSelectFieldProps, "options"> & {
		optionSetId: string;
	};

const query: any = {
	optionSet: {
		resource: "optionSets",
		id: ({ id }: { id: string }) => id,
		params: {
			fields: "id,options[id,name,code]",
		},
	},
};

type Response = {
	optionSet: {
		id: string;
		options: {
			id: string;
			name: string;
			code: string;
		}[];
	};
};

export function RHFOptionSetSelectField({
	optionSetId,
	...props
}: RHFOptionSetSelectFieldProps) {
	const { data, error, loading } = useDataQuery<Response>(query, {
		variables: {
			id: optionSetId,
		},
	});

	const options = useMemo(() => {
		if (loading) return [];
		if (error) return [];
		return (
			data?.optionSet?.options?.map((option) => ({
				label: option.name,
				value: option.code,
			})) ?? []
		);
	}, [data, error, loading]);

	return <RHFSingleSelectField options={options} {...props} />;
}
