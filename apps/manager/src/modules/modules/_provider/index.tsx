import {
	createFileRoute,
	useNavigate,
	useSearch,
} from "@tanstack/react-router";
import React, { useDeferredValue } from "react";
import { ModuleContainer } from "../../../shared/components/ModuleContainer";
import i18n from "@dhis2/d2-i18n";
import { Header } from "../../../shared/components/ModulesPage/components/Header";
import { ModuleList } from "../../../shared/components/ModulesPage/components/ModuleList";
import { AddModule } from "../../../shared/components/ModulesPage/components/AddModule/AddModule";
import { typeFilterSchema } from "../../../shared/schemas/filters";
import { ModuleType } from "@packages/shared/schemas";

export const Route = createFileRoute("/modules/_provider/")({
	component: RouteComponent,
	validateSearch: typeFilterSchema,
});

function RouteComponent() {
	const search = useSearch({ from: "/modules/_provider/" });
	const type = useDeferredValue(search.type);
	const navigate = useNavigate({ from: Route.fullPath });

	const handleTypeChange = (newType: ModuleType | undefined) => {
		navigate({
			search: (prev) => ({ ...prev, type: newType }),
			replace: true,
		});
	};

	return (
		<ModuleContainer title={i18n.t("Modules")}>
			<div className="w-full h-full flex flex-col py-4 px-8">
				<Header
					actions={<AddModule />}
					selectedType={search.type}
					onTypeChange={handleTypeChange}
				/>
				<div className="flex-grow overflow-auto">
					<ModuleList filterType={type} />
				</div>
			</div>
		</ModuleContainer>
	);
}
