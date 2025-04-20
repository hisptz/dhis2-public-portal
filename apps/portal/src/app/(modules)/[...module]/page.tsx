import { last } from "lodash";
import { getAppModule } from "@/utils/module";
import { SectionModule } from "@/components/modules/SectionModule/SectionModule";
import { ModuleType } from "@packages/shared/schemas";
import { VisualizationModule } from "@/components/modules/VisualizationModule/VisualizationModule";

export default async function ModuleLandingPage({
	params,
}: {
	params: Promise<{ module: string[] }>;
}) {
	const { module } = await params;
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
			return <VisualizationModule config={moduleConfig.config} />;
		default:
			return <div>Module type is not supported</div>;
	}
}
