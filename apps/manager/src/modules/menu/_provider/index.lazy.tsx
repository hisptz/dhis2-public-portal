import { createLazyFileRoute } from "@tanstack/react-router";
import React from "react";
import { ModuleContainer } from "../../../shared/components/ModuleContainer";
import { MenuList } from "../../../shared/components/MenuPage/components/MenuList";
import { FormProvider, useForm } from "react-hook-form";
import { AppMenuConfig, menuConfig } from "@packages/shared/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMenuConfig } from "../../../shared/components/MenuPage/providers/MenuProvider";
import { MenuPositionConfig } from "../../../shared/components/MenuPage/components/MenuPositionConfig";
import { SaveMenuConfigChangesButton } from "../../../shared/components/MenuPage/components/SaveMenuConfigChangesButton";

export const Route = createLazyFileRoute("/menu/_provider/")({
	component: RouteComponent,
});

function RouteComponent() {
	const config = useMenuConfig();
	const form = useForm<AppMenuConfig>({
		resolver: zodResolver(menuConfig),
		defaultValues: config,
	});

	return (
		<FormProvider {...form}>
			<ModuleContainer title="App Menu">
				<div className="w-full h-full flex flex-col gap-6">
					<MenuPositionConfig />
					<MenuList />
					<SaveMenuConfigChangesButton />
				</div>
			</ModuleContainer>
		</FormProvider>
	);
}
