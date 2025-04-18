import { last } from "lodash";
import { getAppModule } from "@/utils/module";
import { SectionModule } from "@/components/SectionModule/SectionModule";

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
		case "SECTION":
			return <SectionModule config={moduleConfig} />;
		default:
			return <div>Module type is not supported</div>;
	}
}
