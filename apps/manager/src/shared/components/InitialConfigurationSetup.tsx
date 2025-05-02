import React from "react";
import i18n from "@dhis2/d2-i18n";
import { CreateStatus, useInitialSetup } from "../hooks/config";
import { some } from "lodash";
import {
	Button,
	ButtonStrip,
	colors,
	IconCheckmark16,
	IconCross16,
	IconLaunch24,
	IconSubtract16,
	LinearLoader,
} from "@dhis2/ui";

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
	const { loading, progress, status, setup } = useInitialSetup();
	const hasErrors = some(status, (status) => status.status === "error");

	return (
		<div className="h-full w-full flex flex-col gap-4 justify-center items-center">
			<img
				height={100}
				width={100}
				alt={"logo"}
				src={"/dhis2-app-icon.png"}
			/>
			<div className="flex flex-col justify-center items-center">
				<h1 className="text-2xl font-bold !m-0">
					{i18n.t("Welcome to DHIS2 Public Portal Manager!")}
				</h1>
				{loading && (
					<p className="text-gray-500">
						{i18n.t(
							"Please wait as we setup for first time use...",
						)}
					</p>
				)}
				{!loading &&
					(hasErrors ? (
						<p className="text-gray-500">
							{i18n.t(
								"There were some issues setting up some configurations",
							)}
						</p>
					) : (
						<p className="text-gray-500">
							{i18n.t("Setup complete!")}
						</p>
					))}
			</div>
			{loading && <LinearLoader amount={progress} width={"400px"} />}

			{!loading && (
				<div className="flex flex-col gap-2">
					{status.map(({ message, label, status }) => (
						<div
							key={`${label}-status`}
							className="flex gap-2 items-center"
						>
							<IconSelector status={status} />
							<b>{label}</b>
							<span className="text-gray-500 flex-1">
								<MessageSelector
									status={status}
									message={message}
								/>
							</span>
						</div>
					))}
				</div>
			)}

			{!loading ? (
				!hasErrors ? (
					<Button
						onClick={() => {
							window.location.reload();
						}}
						primary
						icon={<IconLaunch24 />}
						initialFocus
					>
						{i18n.t("Continue to application")}
					</Button>
				) : (
					<ButtonStrip>
						<Button icon={<IconLaunch24 />}>
							{i18n.t("Continue to application")}
						</Button>
						<Button
							onClick={() => {
								setup();
							}}
						>
							{i18n.t("Try again")}
						</Button>
					</ButtonStrip>
				)
			) : null}
		</div>
	);
}
