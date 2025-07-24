import { AddSourceFormValues } from "../components/AddDataSourceForm";
import {
	FetchError,
	useAlert,
	useDataEngine,
	useDataMutation,
} from "@dhis2/app-runtime";
import { DataServiceConfig } from "@packages/shared/schemas";
import { DatastoreNamespaces } from "@packages/shared/constants";
import i18n from "@dhis2/d2-i18n";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useRefreshDataSources } from "../providers/DataSourcesProvider";

const createRouteMutation = {
	type: "create" as const,
	resource: "routes",
	data: ({ data }: { data: any }) => data,
};

function generateRouteMutation(id: string) {
	return {
		type: "create" as const,
		resource: `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}/${id}`,
		data: ({ data }: { data: DataServiceConfig }) => data,
	};
}

export function useCreateDataSource() {
	const refreshList = useRefreshDataSources();
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const navigate = useNavigate({
		from: "/data-service-configuration/",
	});
	const [createRoute] = useDataMutation(createRouteMutation);
	const engine = useDataEngine();
	const save = async (data: AddSourceFormValues) => {
		try {
			const routePayload = {
				code: data.id,
				disabled: false,
				name: `[data service] ${data.source.name}`,
				url: `${data.source.url}/api/**`,
				auth: data.source.pat
					? {
							type: "api-token",
							token: data.source.pat,
						}
					: {
							type: "http-basic",
							username: data.source.username,
							password: data.source.password,
						},
			};

			const response = (await createRoute({ data: routePayload })) as {
				response: { uid: string };
			};
			const routeId = response.response.uid;
			const payload = {
				source: {
					name: data.source.name,
					routeId,
				},
				id: data.id,
				itemsConfig: data.itemsConfig,
				visualizations: data.visualizations,
			} as DataServiceConfig;

			await engine.mutate(generateRouteMutation(data.id), {
				variables: {
					data: payload,
				},
			});

			show({
				message: i18n.t("Configuration saved successfully"),
				type: { success: true },
			});
			refreshList();
			navigate({
				to: "/data-service-configuration/$configId",
				params: {
					configId: data.id,
				},
			});
		} catch (error) {
			if (error instanceof FetchError) {
				show({
					message: `${i18n.t("Failed to save configuration")}:${error.message}`,
					type: { critical: true },
				});
			}
			if (error instanceof Error) {
				show({
					message: `${i18n.t("Failed to save configuration")}:${error.message}`,
					type: { critical: true },
				});
			}
		}
	};

	return {
		save,
	};
}

const updateRouteMutation = {
	type: "update" as const,
	resource: "routes",
	id: ({ id }: { id: string }) => id,
	data: ({ data }: { data: any }) => data,
};

const updateDataSourceMutation: any = {
	type: "update" as const,
	resource: `dataStore/${DatastoreNamespaces.DATA_SERVICE_CONFIG}`,
	id: ({ id }: { id: string }) => id,
	data: ({ data }: { data: DataServiceConfig }) => data,
};

export function useUpdateDataSource() {
	const navigate = useNavigate({
		from: "/data-service-configuration/$configId/",
	});
	const { configId } = useParams({
		from: "/data-service-configuration/_provider/$configId/_provider/",
	});
	const refreshList = useRefreshDataSources();
	const { show } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);
	const [mutate] = useDataMutation(updateDataSourceMutation, {
		variables: {
			id: configId,
		},
		onComplete: () => {
			show({
				message: i18n.t("Configuration updated successfully"),
				type: { success: true },
			});
		},
		onError: (error) => {
			show({
				message: `${i18n.t("Could not save changes")}: ${error.message}`,
				type: { critical: true },
			});
		},
	});

	const save = async (data: DataServiceConfig) => {
		await mutate({ data });
		refreshList();
		await navigate({
			to: "/data-service-configuration",
		});
	};

	return {
		save,
	};
}
