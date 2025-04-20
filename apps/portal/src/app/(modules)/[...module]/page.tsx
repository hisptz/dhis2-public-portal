import { last } from "lodash";
import { getAppModule } from "@/utils/module";
import { SectionModule } from "@/components/modules/SectionModule/SectionModule";
import { ModuleType } from "@packages/shared/schemas";
import { VisualizationModule } from "@/components/modules/VisualizationModule/VisualizationModule";

export default async function ModuleLandingPage({
	params,
	searchParams,
}: {
	params: Promise<{ module: string[] }>;
	searchParams: Promise<{ group?: string }>;
}) {
	const { module } = await params;
	const searchParamsValue = await searchParams;
	const moduleId = last(module);

	if (!moduleId) {
		return <div>Module id is not found on the path </div>;
	}

	const moduleConfig = await getAppModule(moduleId);

	if (!moduleConfig) {
		return <div>Module config is not found</div>;
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
		default:
			return <div>Module type is not supported</div>;
	}
}
