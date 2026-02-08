import { useDataEngine } from "@dhis2/app-runtime";
import { useQuery } from "@tanstack/react-query";
import { CircularLoader, Tag } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useWatch } from "react-hook-form";
import { DataServiceConfig } from "@packages/shared/schemas";

export type RunStatus = "IGNORED" | "QUEUED" | "RUNNING" | "ERRORED" | "DONE";

const query = {
	status: {
		resource: "routes/data-service/run/",
		id: ({
			configId,
			runId,
			type,
		}: {
			configId: string
			runId: string
			type: "metadata" | "data"
		}) => `${configId}/${type}/${runId}/status`,
	},
}

export function RunStatus({
	runId,
	type,
}: {
	runId: string
	type: "metadata" | "data"
}) {
	const config = useWatch<DataServiceConfig>()
	const engine = useDataEngine()

	const enabled = Boolean(config?.id && runId)

	const { data, isLoading, error } = useQuery({
		queryKey: [config?.id, "runs", type, runId, "status"],
		enabled,
		queryFn: async () => {
			const data = await engine.query(query, {
				variables: {
					configId: config.id,
					runId,
					type,
				},
			})

			return data.status as { status: RunStatus }
		},
		refetchInterval: (query) =>
			query?.status === "RUNNING" ? 1000 : false,
	})


	if (isLoading) {
		return <CircularLoader extrasmall />
	}

	if (error || !data) {
		return <span>{i18n.t("N/A")}</span>
	}

	switch (data.status) {
		case "DONE":
			return <Tag positive>{i18n.t("Done")}</Tag>
		case "ERRORED":
			return <Tag negative>{i18n.t("Has errors")}</Tag>
		case "RUNNING":
			return <Tag neutral>{i18n.t("Running")}</Tag>
		case "QUEUED":
			return <Tag>{i18n.t("Queued")}</Tag>
		case "IGNORED":
			return <Tag>{i18n.t("Not ran")}</Tag>
		default:
			return <span>{i18n.t("N/A")}</span>
	}
}
