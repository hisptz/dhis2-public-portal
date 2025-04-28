import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import React, { useEffect, useState } from "react";
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
	const type = search.type as ModuleType | undefined;
	const navigate = useNavigate({ from: Route.fullPath });

	const [filterType, setFilterType] = useState<ModuleType | undefined>(type);

    useEffect(() => {
        if (type !== filterType) {
            setFilterType(type);
        }
    }, [filterType, type]);


	const handleTypeChange = (newType: ModuleType | undefined) => {
        setFilterType(newType);
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
                    selectedType={filterType} 
					onTypeChange={handleTypeChange}
				/>
				<div className="flex-grow overflow-auto"> 
                    <ModuleList filterType={filterType} />
                </div>
			</div>
		</ModuleContainer>
	);
}
