// @ts-ignore
import { useDataQuery } from "@dhis2/app-runtime";
import { type OrganisationUnit, OrgUnitSelection } from "@hisptz/dhis2-utils";
import { useEffect, useMemo } from "react";
import { forEach, isEmpty } from "lodash";

const orgUnitQuery = {
	ou: {
		resource: "organisationUnits",
		params: ({ orgUnits }: { orgUnits: string }) => {
			return {
				fields: ["id", "displayName", "path", "level"],
				filter: `id:in:[${orgUnits!}]`,
			};
		},
	},
};

export function useOrgUnit(orgUnitIds?: string[]) {
	const values = useMemo(() => orgUnitIds, [orgUnitIds]);
	const { refetch, data, loading } = useDataQuery<{
		ou: {
			organisationUnits: OrganisationUnit[];
		};
	}>(orgUnitQuery as never, {
		lazy: !values,
		variables: {
			orgUnits: values,
		},
	});

	useEffect(() => {
		refetch({
			orgUnits: values,
		});
	}, [values, refetch]);

	return {
		loading,
		orgUnit: data?.ou.organisationUnits,
		refetch,
	};
}

export function getOrgUnitsSelection(orgUnitSelection: OrgUnitSelection) {
	const orgUnits = [];
	if (orgUnitSelection.userOrgUnit) {
		orgUnits.push("USER_ORGUNIT");
	}

	if (orgUnitSelection.userSubUnit) {
		orgUnits.push("USER_ORGUNIT_CHILDREN");
	}

	if (orgUnitSelection.userSubX2Unit) {
		orgUnits.push("USER_ORGUNIT_GRANDCHILDREN");
	}
	if (!isEmpty(orgUnitSelection.levels)) {
		forEach(orgUnitSelection.levels, (level) =>
			orgUnits.push(`LEVEL-${level}`),
		);
	}

	return [
		...orgUnits,
		...(orgUnitSelection?.orgUnits?.map(
			(ou: OrganisationUnit) => `${ou.id}`,
		) ?? []),
	];
}
