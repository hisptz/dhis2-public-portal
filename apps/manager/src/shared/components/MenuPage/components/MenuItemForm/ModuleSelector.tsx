import { useGetDatastoreEntries } from "../../../../hooks/datastore";
import { DatastoreNamespaces } from "@packages/shared/constants";
import React, { useMemo } from "react";
import { AppModule } from "@packages/shared/schemas";
import { capitalize, startCase } from "lodash";
import { RHFSingleSelectField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { MenuDataInput } from "./MenuDataInput";

export function ModuleSelector({ subMenu }: { subMenu?: boolean }) {
	const { data, loading } = useGetDatastoreEntries<
		AppModule,
		"id" | "label" | "type"
	>({
		namespace: DatastoreNamespaces.MODULES,
		fields: ["id", "label", "type"],
	});

	const options = useMemo(() => {
		if (data) {
			return data.map(({ id, label, type }) => ({
				label: `${label} (${capitalize(startCase(type))})`,
				value: id,
			}));
		}
		return [];
	}, [data]);

	return (
		<>
			<RHFSingleSelectField
				filterable
				required
				loading={loading}
				name="moduleId"
				label={i18n.t("Module")}
				options={options}
			/>
			{!subMenu && <MenuDataInput />}
		</>
	);
}
