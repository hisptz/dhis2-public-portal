import { last } from "lodash";
import { getAppModule } from "@/utils/module";
import { SectionModule } from "@/components/modules/SectionModule/SectionModule";
import { ModuleType } from "@packages/shared/schemas";
import { VisualizationModule } from "@/components/modules/VisualizationModule/VisualizationModule";
import { StaticModule } from "@/components/modules/StaticModule/StaticModule";
import { DetailsPage } from "@/components/modules/StaticModule/components/DetailsPage";
import { Box } from "@mantine/core";
import { BaseCardError } from "@/components/CardError";
import { DocumentsModule } from "@/components/modules/DocumentsModule/DocumentsModule";

export default async function ModuleLandingPage({
	params,
	searchParams,
}: {
	params: Promise<{ module: string[] }>;
	searchParams: Promise<{ group?: string }>;
}) {
	const { module } = await params;
	const searchParamsValue = await searchParams;

	if (module.includes("details")) {
		//We are dealing with a details page
		const resourceId = last(module)!;
		const moduleConfig = module.slice(-3, -2)[0];
		return <DetailsPage moduleId={moduleConfig} id={resourceId} />;
	}

	const moduleId = last(module);
	if (!moduleId) {
		return (
			<Box className="w-full h-[500px] flex items-center justify-center">
				<BaseCardError
					error={
						new Error(
							"Could not determine what to show. Please check your configuration",
						)
					}
				/>
			</Box>
		);
	}

	const moduleConfig = await getAppModule(moduleId);

	if (!moduleConfig) {
		return (
			<Box className="w-full h-[500px] flex items-center justify-center">
				<BaseCardError
					error={
						new Error(
							`Could not retrieve configuration for ${moduleId}`,
						)
					}
				/>
			</Box>
		);
	}

	switch (moduleConfig.type) {
		case ModuleType.SECTION:
			return <SectionModule config={moduleConfig} />;
		case ModuleType.VISUALIZATION:
			return (
				<VisualizationModule
					searchParams={searchParamsValue}
					config={moduleConfig.config}
				/>
			);
		case ModuleType.STATIC:
			return (
				<StaticModule
					moduleId={moduleId}
					config={moduleConfig.config}
				/>
			);
		case ModuleType.DOCUMENTS:
			return (
				<DocumentsModule
					config={moduleConfig.config}
					searchParams={searchParamsValue}
				/>
			);
		default:
			return (
				<Box className="h-min-[500px] w-full h-full flex items-center justify-center">
					<BaseCardError
						error={new Error("Module type is not supported")}
					/>
				</Box>
			);
	}
}
