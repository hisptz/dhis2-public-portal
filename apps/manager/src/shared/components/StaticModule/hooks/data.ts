import { useDataQuery } from "@dhis2/app-runtime";
import { sortBy } from "lodash";
import { StaticItemConfig, StaticModule } from "@packages/shared/schemas";
import { useModule } from "../../ModulesPage/providers/ModuleProvider";
import { Pagination } from "@hisptz/dhis2-utils";

const namespaceQuery = {
    namespace: {
        resource: "dataStore",
        id: ({ namespace }: { namespace: string }) => namespace,
        params: {
            fields: ".", 
        },
    },
};

type Response = {
    namespace: {
        pager: Pagination;
        entries: {
            key: string;
            value: StaticItemConfig[];
        }[];
    };
};


export function useItemList() {
    const module = useModule() as StaticModule;
    const namespace = module?.config.namespace;
    const {
        data: namespaceData,
        loading: namespaceLoading,
        error: namespaceError,
        refetch,
    } = useDataQuery<Response>(namespaceQuery, {
        variables: { namespace },
        lazy: !namespace,
    });
    return {
        items: namespaceData?.namespace.entries.map(({ value }) => value) ?? [],
        loading: namespaceLoading || !module,
        error: namespaceError || (!module ? new Error("Module not found") : null),
        refetch,
    };
}

const singleQuery = {
    item: {
        resource: "dataStore",
        id: ({ namespace, key }: { namespace: string; key: string }) => `${namespace}/${key}`,
        params: {
            fields: "id,title,icon,shortDescription,content",
        },
    },
};

type SingleResponse = {
    item: StaticItemConfig;
};

export function useItemById(key: string) {
    if (!key) throw new Error("moduleId and key are required");
    const module = useModule() as StaticModule;
    const namespace = module?.config.namespace;
    const {
        data,
        loading: itemLoading,
        error: itemError,
        refetch,
    } = useDataQuery<SingleResponse>(singleQuery, {
        variables: { namespace, key },
        lazy: !namespace || !key, 
    });
    return {
        item: data?.item,
        loading: itemLoading,
        error: itemError,
        refetch,
    };
}