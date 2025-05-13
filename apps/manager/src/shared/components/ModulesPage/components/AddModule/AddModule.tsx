import { useBoolean } from "usehooks-ts";
import React from "react";
import { Button, IconAdd24 } from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { useRefreshModules } from "../../providers/ModulesProvider";
import { AppModule } from "@packages/shared/schemas";
import { AddModuleForm } from "./components/AddModuleForm";
import { useNavigate } from "@tanstack/react-router";

export function AddModule() {
	const refreshModules = useRefreshModules();
	const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true);
	const navigate = useNavigate({
		from: "/modules",});

	return (
		<>
			{!hide && (
				<AddModuleForm
					onComplete={(module: AppModule) => {
						refreshModules();
						navigate({
							to: "$moduleId/edit",
							params: {
								moduleId: module.id,
							},
						});		
						}}
					hide={hide}
					onClose={onHide}
				/>
			)}
			<Button icon={<IconAdd24 />} primary onClick={onShow}>
				{i18n.t("Create a new module")}
			</Button>
		</>
	);
}
