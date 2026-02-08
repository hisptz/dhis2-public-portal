import { DataRun, MetadataRun, useConfigurationRuns } from "@/shared/components/DataConfiguration/components/RunList/hooks/data";
import { CircularLoader, colors, IconError24, SegmentedControl } from "@dhis2/ui";
import { SimpleDataTable } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";
import { PeriodUtility } from "@hisptz/dhis2-utils";
import { DateTime } from "luxon";
import { RunConfigSummary } from "@/shared/components/DataConfiguration/components/RunConfiguration/components/RunConfigSummary/RunConfigSummary";
import { DataServiceConfig } from "@packages/shared/schemas";
import { useWatch } from "react-hook-form";
import { RunStatus } from "../RunStatus";
import { useMemo, useState } from "react";

export function RunList() {
	const config = useWatch<DataServiceConfig>()
	const [activeTab, setActiveTab] = useState<'metadata' | 'data'>('metadata')
	const { loading, dataRuns, metadataRuns, fetching, pagination, error } =
		useConfigurationRuns();

	const transformRun = (run: MetadataRun|DataRun, configurationsValue: string) => ({
		id: run.uid,
		...run,
		startedAt: DateTime.fromISO(run.startedAt).toFormat(
			"yyyy-MM-dd HH:mm:ss",
		),
		periods: run.periods?.map((period: string) => {
				return PeriodUtility.getPeriodById(period).name;
			})
			.join(", "),
		configurations: configurationsValue,
		status: (
			<>
				<RunStatus runId={run.uid} type={activeTab} />
			</>
		),
		actions: (
			<>
				<RunConfigSummary runId={run.uid} type={activeTab}/>
			</>
		),
	});

	const rows = useMemo(() => {
		if (activeTab === 'metadata') {
			return metadataRuns?.map((run) => transformRun(run, run.mainConfigId)) ?? [];
		} else {
			return dataRuns?.map((run) => {
				const configurations = run.configIds.map((configId: string) => {
					const conf = config?.itemsConfig?.find(
						({ id }: { id: string }) => id === configId,
					);
					return conf?.name ?? i18n.t("Unknown");
				});
				return transformRun(run, configurations.join(", "));
			}) ?? [];
		}
	}, [dataRuns, metadataRuns, config, activeTab]);


	if (loading) {
		return (
			<div className="w-full h-full flex justify-center items-center">
				<CircularLoader small />
			</div>
		);
	}

	if (error) {
		return (
			<div className="w-full h-full flex justify-center items-center">
				<IconError24 />
				<span style={{ color: colors.grey700 }}>{error.message}</span>
			</div>
		);
	}

	return (
		<>
			<div className='flex flex-row justify-start items-center'>
				<SegmentedControl
					selected={activeTab}
					onChange={({ value }) =>
						setActiveTab(value as 'metadata' | 'data')
					}
					options={[
						{
							label: i18n.t('Metadata Runs'),
							value: 'metadata',
						},
						{ label: i18n.t('Data Runs'), value: 'data' },

					]}
				/>
			</div>


			<SimpleDataTable
				pagination={pagination}
				emptyLabel={i18n.t(`There are no ${activeTab === 'metadata' ? 'metadata' : 'data'} runs for this configuration`)}
				loading={fetching}
				rows={rows}
				columns={[
					{
						key: "uid",
						label: i18n.t("Run ID"),
					},
					{
						key: "startedAt",
						label: i18n.t("Initialized at"),
					},
					{
						key: "periods",
						label: i18n.t("Period(s)"),
					},
					{
						key: "configurations",
						label: i18n.t("Configuration(s)"),
					},
					{
						key: "status",
						label: i18n.t("Status"),
					},
					{
						key: "actions",
						label: i18n.t("Actions"),
					},
				]}
			/>

		</>

	);
}
