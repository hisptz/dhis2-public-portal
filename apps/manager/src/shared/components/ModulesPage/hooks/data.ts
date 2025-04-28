import { useDataQuery } from "@dhis2/app-runtime";
import { Pagination } from "@hisptz/dhis2-utils";
import { sortBy } from "lodash";
import { DatastoreNamespaces } from "@packages/shared/constants";
import { AppModule } from "@packages/shared/schemas";

const query = {
    modules: {
        resource: `dataStore/${DatastoreNamespaces.MODULES}`,
        params: {
            fields: ".",
        },
    },
};

type Response = {
    modules: {
        pager: Pagination;
        entries: {
            key: string;
            value: AppModule;
        }[];
    };
};

export function useModuleList() {
    const { data, ...rest } = useDataQuery<Response>(query);

    return {
        modules: sortBy(
            data?.modules?.entries?.map(({ value }) => value),
            "sortOrder",
        ),
        ...rest,
    };
}

const singleQuery = {
    module: {
        resource: `dataStore/${DatastoreNamespaces.MODULES}`,
        id: ({ id }: { id: string }) => id,
        params: {
            fields: ".",
        },
    },
};

type SingleResponse = {
    module: AppModule;
};

export function useModuleById(id: string) {
    const { data, ...rest } = useDataQuery<SingleResponse>(singleQuery, {
        variables: {
            id,
        },
    });

    return {
        module: data?.module,
        ...rest,
    };
}
