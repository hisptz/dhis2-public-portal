import { createFileRoute, Outlet, useParams } from "@tanstack/react-router";
import React from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useGetDataSource } from "../../../../shared/components/DataConfiguration/hooks/data";
import {
	DataServiceConfig,
	dataServiceConfigSchema,
} from "@packages/shared/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { FullLoader } from "../../../../shared/components/FullLoader";
import { DataConfigurationActions } from "../../../../shared/components/DataConfiguration/components/DataConfigurationActions";

export const Route = createFileRoute(
	"/data-service-configuration/_provider/$configId/_provider",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { configId } = useParams({
		from: "/data-service-configuration/_provider/$configId/_provider",
	});
	const { refetch } = useGetDataSource(configId);
	const form = useForm<DataServiceConfig>({
		resolver: zodResolver(dataServiceConfigSchema),
		defaultValues: async () => {
			const response = (await refetch()) as { config: DataServiceConfig };
			return response.config;
		},
	});

	if (form.formState.isLoading) {
		return <FullLoader />;
	}

	return (
		<FormProvider {...form}>
			<div className="flex flex-col gap-4">
				<div className="flex-1 w-full">
					<Outlet />
				</div>
				<DataConfigurationActions />
			</div>
		</FormProvider>
	);
}
