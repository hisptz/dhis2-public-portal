import React, { useState } from "react";
import i18n from "@dhis2/d2-i18n";
import { CreateStatus, useInitialSetup } from "../hooks/config";
import { some } from "lodash";
import {
	Button,
	ButtonStrip,
	colors,
	IconCheckmark16,
	IconCross16,
	IconLaunch16,
	IconLaunch24,
	IconSubtract16,
	LinearLoader,
} from "@dhis2/ui";
import { ImportConfiguration } from "./ImportConfiguration";
import TemplateCard from "./TemplateCard";

function IconSelector(status: { status: CreateStatus["status"] }) {
	switch (status.status) {
		case "created":
			return <IconCheckmark16 color={colors.green600} />;
		case "exists":
			return <IconSubtract16 color={colors.grey600} />;
		case "error":
			return <IconCross16 color={colors.red600} />;
	}
}

function MessageSelector(status: {
	status: CreateStatus["status"];
	message?: string;
}) {
	switch (status.status) {
		case "created":
			return i18n.t("Created successfully");
		case "exists":
			return i18n.t("Configuration exists");
		case "error":
			return status.message ?? "Unknown error";
	}
}

export function InitialConfigurationSetup() {
	const { loading, progress: setupProgress, status, setup } = useInitialSetup();
	const [importLoading, setImportLoading] = useState(false);
	const [importStatuses, setImportStatuses] = useState<CreateStatus[]>([]);
	const [progress, setProgress] = useState(0);

	const hasErrors = some([...status, ...importStatuses], (s) => s.status === "error");
	const handleStatusChange = (newStatuses: CreateStatus[]) => {
		setImportStatuses((prev) => [...prev, ...newStatuses]);
	};
	const handleProgressChange = (newProgress: number) => {
		setProgress(newProgress);
	};
	const displayProgress = importLoading ? progress : setupProgress;

	return (
		<div className="h-full w-full flex flex-col gap-4 justify-center items-center">
			<img
				height={100}
				width={100}
				alt={"logo"}
				src={"dhis2-app-icon.png"}
			/>
			<div className="flex flex-col justify-center items-center">
				<h1 className="text-2xl font-bold !m-0">
					{i18n.t("Welcome to DHIS2 FlexiPortal Manager!")}
				</h1>
				{loading || importLoading ? (
					<p className="text-gray-500">
						{i18n.t("Please wait as we setup for first time use...")}
					</p>
				) : hasErrors ? (
					<p className="text-gray-500">
						{i18n.t("There were some issues setting up some configurations")}
					</p>
				) : (
					<p className="text-gray-500">
						{i18n.t("Please choose how you would like to initially setup your portal")}
					</p>
				)}
			</div>
			{(loading || importLoading) && <LinearLoader amount={displayProgress} width={"400px"} />}
			{!(loading || importLoading) && (
				<div className="flex flex-col gap-2">
					{[...status, ...importStatuses].map((s, index) => (
						<div
							key={`${s.label}-${index}-status`}
							className="flex gap-2 items-center"
						>
							<IconSelector status={s.status} />
							<b>{s.label}</b>
							<span className="text-gray-500 flex-1">
								<MessageSelector status={s.status} message={s.message} />
							</span>
						</div>
					))}
				</div>
			)}
			{!(loading || importLoading) && hasErrors ? (
				<ButtonStrip>
					<Button icon={<IconLaunch24 />} onClick={() => window.location.reload()}>
						{i18n.t("Continue to application")}
					</Button>
					<Button onClick={() => setup()}>
						{i18n.t("Try again")}
					</Button>
				</ButtonStrip>
			) : <div className="flex flex-row gap-4">
				<TemplateCard template={{
					title: "Setup default configuration", icon: <IconLaunch16 />, description: "Initialize your portal with a standard set of configurations for quick setup.", onClick: () => {
						setup().then(() => {
							window.location.reload();
						});
					}
				}} />
				<ImportConfiguration
					setImportLoading={setImportLoading}
					onStatusChange={handleStatusChange}
					onProgressChange={handleProgressChange}
				/>
			</div>}
		</div>
	);
}
