import React, { useMemo } from "react";
import {
	RHFMultiSelectField,
	RHFMultiSelectFieldProps,
} from "./RHFMultiSelectField";
import { useDataQuery } from "@dhis2/app-runtime";

export type RHFOptionSetMultiSelectFieldProps = Omit<
	RHFMultiSelectFieldProps,
	"options"
> & {
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

export function RHFOptionSetMultiSelectField({
	optionSetId,
	...props
}: RHFOptionSetMultiSelectFieldProps) {
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

	return <RHFMultiSelectField options={options} {...props} />;
}
