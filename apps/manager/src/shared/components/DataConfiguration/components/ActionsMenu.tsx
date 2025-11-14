import React, { useRef, useState } from "react";
import {
	Button,
	IconMore24,
	Popover,
	Menu,
	MenuItem,
	Divider,
	IconEdit16,
	IconLaunch16,
	IconTerminalWindow16,
	IconDelete16,
	IconImportItems24,
} from "@dhis2/ui";
import { DataServiceConfig } from "@packages/shared/schemas";
import { useNavigate } from "@tanstack/react-router";
import i18n from "@dhis2/d2-i18n";
import { useDialog } from "@hisptz/dhis2-ui";
import { useDeleteDataSource } from "../hooks/save";
import { useBoolean } from "usehooks-ts";
import { RunConfigForm } from "./RunConfiguration/components/RunConfigForm/RunConfigForm";
import { RunConfigSummaryModal } from "./RunConfiguration/components/RunConfigSummary/components/RunConfigSummaryModal";

export function ActionsMenu({ config }: { config: DataServiceConfig }) {
	const [isOpen, setIsOpen] = useState(false);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const navigate = useNavigate({
		from: "/data-service-configuration/",
	});
	const { confirm } = useDialog();
	const { deleteConfig } = useDeleteDataSource();

	const {
		value: hideRunModal,
		setTrue: onCloseRunModal,
		setFalse: onShowRunModal,
	} = useBoolean(true);

	const {
		value: hideSummaryModal,
		setTrue: onCloseSummaryModal,
		setFalse: onShowSummaryModal,
	} = useBoolean(true);

	const handleEdit = () => {
		setIsOpen(false);
		navigate({
			to: "/data-service-configuration/$configId",
			params: {
				configId: config.id,
			},
		});
	};

	const handleRun = () => {
		setIsOpen(false);
		onShowRunModal();
	};

	const handleViewOverview = () => {
		setIsOpen(false);
		onShowSummaryModal();
	};

	const handleDelete = () => {
		setIsOpen(false);
		confirm({
			title: i18n.t("Confirm delete"),
			message: (
				<span>
					{i18n.t("Are you sure you want to delete the configuration ")}
					<b>{config.source.name}</b>?{" "}
					{i18n.t("This action cannot be undone.")}
				</span>
			),
			onConfirm: async () => {
				await deleteConfig(config);
			},
			confirmButtonText: i18n.t("Delete"),
			confirmButtonColor: "destructive",
		});
	};

	return (
		<>
			{!hideRunModal && (
				<RunConfigForm
					config={config}
					hide={hideRunModal}
					onClose={onCloseRunModal}
				/>
			)}
			{!hideSummaryModal && (
				<RunConfigSummaryModal
					hide={hideSummaryModal}
					onClose={onCloseSummaryModal}
					config={config}
				/>
			)}

			<div ref={buttonRef as any}>
				<Button
					small
					secondary
					icon={<IconMore24 />}
					onClick={() => setIsOpen(!isOpen)}
				/>
			</div>

			{isOpen && (
				<Popover
					reference={buttonRef as any}
                    arrow={false}
 					placement="bottom-start"
					onClickOutside={() => setIsOpen(false)}
				>
					<Menu>
						<MenuItem
							label={i18n.t("Edit connenction")}
							icon={<IconEdit16 />}
							onClick={handleEdit}
						/>
						<MenuItem
							label={i18n.t("Run migration")}
							icon={<IconImportItems24 />}
							onClick={handleRun}
						/>
						<MenuItem
							label={i18n.t("View overview")}
							icon={<IconTerminalWindow16 />}
							onClick={handleViewOverview}
						/>
						<Divider />
						<MenuItem
							label={i18n.t("Delete connection")}
							icon={<IconDelete16 />}
							onClick={handleDelete}
							destructive
						/>
					</Menu>
				</Popover>
			)}
		</>
	);
}
