/*
 * Tools that enable initial checking of metadata and generating the metadata accordingly
 *
 * */

import { DatastoreNamespaces } from "@packages/shared/constants";
import { FetchError, useDataEngine, useDataQuery } from "@dhis2/app-runtime";
import { defaultGeneralConfig } from "../constants/defaults/general";
import { defaultMenuConfig } from "../constants/defaults/menu";
import { defaultModules } from "../constants/defaults/modules";
import { useCallback, useEffect, useState } from "react";
import i18n from "@dhis2/d2-i18n";

const metaCheckQuery = {
	main: {
		resource: `dataStore/${DatastoreNamespaces.MAIN_CONFIG}`,
	},
	modules: {
		resource: `dataStore/${DatastoreNamespaces.MODULES}`,
	},
};

export function useCheckConfig() {
	const { data, loading, error } = useDataQuery(metaCheckQuery);
	return {
		loading,
		metadataExists: data && !error,
	};
}

function generateCreateConfigMutation({
	namespace,
	key,
}: {
	namespace: string;
	key: string;
}) {
	return {
		type: "create" as const,
		resource: `dataStore/${namespace}/${key}`,
		data: ({ data }: { data: any }) => data,
	};
}

interface CreateResponse {
	httpStatusCode: number;
	message: number;
	status: string;
}

export interface CreateStatus {
	status: "created" | "exists" | "error";
	message?: string;
	label: string;
}

export function useInitializeConfig() {
	const engine = useDataEngine();

	const initializeConfig = useCallback(
		async function initializeConfig<T extends Object = Object>({
			namespace,
			key,
			data,
			label,
		}: {
			namespace: string;
			key: string;
			label: string;
			data: T;
		}): Promise<CreateStatus> {
			const mutation = generateCreateConfigMutation({ namespace, key });
			try {
				const response = (await engine.mutate(mutation, {
					variables: {
						data,
					},
				})) as unknown as CreateResponse;
				return {
					status: "created",
					label,
				};
			} catch (e) {
				if (e instanceof FetchError) {
					if (e.details.httpStatusCode === 409) {
						return {
							status: "exists",
							label,
						};
					} else {
						return {
							status: "error",
							message: e.message,
							label,
						};
					}
				} else {
					return {
						status: "error",
						message: e.message,
						label,
					};
				}
			}
		},
		[engine],
	);

	return {
		initializeConfig,
	};
}

const setupConfiguration = [
	{
		namespace: DatastoreNamespaces.MAIN_CONFIG,
		key: "metadata",
		data: defaultGeneralConfig,
		label: i18n.t("General"),
	},
	{
		namespace: DatastoreNamespaces.MAIN_CONFIG,
		key: "menu",
		data: defaultMenuConfig,
		label: i18n.t("Menu"),
	},
	{
		namespace: DatastoreNamespaces.MAIN_CONFIG,
		key: "appearance",
		data: defaultMenuConfig,
		label: i18n.t("Appearance"),
	},
	{
		namespace: DatastoreNamespaces.MODULES,
		key: "modules",
		data: defaultModules,
		label: i18n.t("Modules"),
	},
];

export function useInitialSetup() {
	const [loading, setLoading] = useState<boolean>(false);
	const [status, setStatus] = useState<CreateStatus[]>([]);
	const { initializeConfig } = useInitializeConfig();

	const setup = useCallback(
		async function setup() {
			setLoading(true);
			setStatus([]);
			for (const config of setupConfiguration) {
				const status =
					await initializeConfig<typeof config.data>(config);
				setStatus((prev) => [...prev, status]);
			}
			setLoading(false);
		},
		[initializeConfig],
	);

	useEffect(() => {
		setup();
	}, []);

	const progress = (status.length / setupConfiguration.length) * 100;

	return {
		loading,
		status,
		progress,
		setup,
	};
}
