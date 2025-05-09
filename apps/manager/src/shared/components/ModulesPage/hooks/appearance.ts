import { useDataQuery } from "@dhis2/app-runtime";
import { DatastoreKeys, DatastoreNamespaces } from "@packages/shared/constants";
import { AppAppearanceConfig } from "@packages/shared/schemas";

const query = {
    appearance: {
        resource: `dataStore/${DatastoreNamespaces.MAIN_CONFIG}`,
        id: ({ id }: { id: string }) => id,
        params: {
            fields: ".",
        },
    },
};

type SingleResponse = {
    appearance: AppAppearanceConfig;
};

export function useAppearance() {
    const id = DatastoreKeys.APPEARANCE;
    const { data, ...rest } = useDataQuery<SingleResponse>(query, {
        variables: {
            id,
        },
    });

    return {
        appearance: data?.appearance,
        ...rest,
    };
}
