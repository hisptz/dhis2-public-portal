import {
	createFileRoute,
	useNavigate,
	useParams,
} from "@tanstack/react-router";
import React from "react";
import i18n from "@dhis2/d2-i18n";
import { Button, ButtonStrip, Divider } from "@dhis2/ui";
import { useFormContext } from "react-hook-form";
import { z } from "zod";
import { DashboardLayoutEditor } from "../../../../../../shared/components/DashboardLayoutEditor";
import { AppModule } from "@packages/shared/schemas";

export const Route = createFileRoute(
	"/modules/_provider/$moduleId/_formProvider/edit/layout",
)({
	component: RouteComponent,
});

function RouteComponent() {
	const { moduleId } = useParams({
		from: "/modules/_provider/$moduleId",
	});
	const { resetField } = useFormContext<AppModule>();
	const navigate = useNavigate();

	const goBack = () => {
		navigate({
			to: "/modules/$moduleId/edit",
			params: { moduleId },
		});
	};

	return (
		<div className="w-full h-full flex flex-col gap-4">
			<div className="w-full flex flex-col ">
				<div className="flex justify-between gap-8">
					<h2 className="text-2xl">{i18n.t("Layout editor")}</h2>
					<ButtonStrip end>
						<Button
							onClick={() => {
								resetField("config.layouts");
								goBack();
							}}
						>
							{i18n.t("Cancel")}
						</Button>
						<Button
							primary
							onClick={() => {
								goBack();
							}}
						>
							{i18n.t("Update layout")}
						</Button>
					</ButtonStrip>
				</div>

				<Divider />
			</div>
			<div className="w-full flex-1">
				<DashboardLayoutEditor />
			</div>
			<div>
				<ButtonStrip end>
					<Button
						onClick={() => {
							resetField("config.layouts");
							goBack();
						}}
					>
						{i18n.t("Cancel")}
					</Button>
					<Button
						primary
						onClick={() => {
							goBack();
						}}
					>
						{i18n.t("Update layout")}
					</Button>
				</ButtonStrip>
			</div>
		</div>
	);
}

