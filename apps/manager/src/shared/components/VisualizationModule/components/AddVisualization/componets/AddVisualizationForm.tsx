import { FormProvider, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import {
	Button,
	ButtonStrip,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { RHFSingleSelectField } from "@hisptz/dhis2-ui";
import { VisualizationSelector } from "./VisualizationSelector";
import {
	VisualizationDisplayItemType,
	VisualizationItem,
	visualizationItemSchema,
} from "@packages/shared/schemas";
import { RHFTextAreaField } from "../../../../Fields/RHFTextAreaField";

export function AddVisualizationForm({
	visualization,
	hide,
	onClose,
	onSubmit,
}: {
	visualization?: VisualizationItem;
	hide: boolean;
	onClose: () => void;
	onSubmit: (visualization: VisualizationItem) => void;
}) {
	const form = useForm<VisualizationItem>({
		resolver: zodResolver(visualizationItemSchema),
		defaultValues: visualization,
	});

	const onAdd = (visualization: VisualizationItem) => {
		onSubmit(visualization);
		onClose();
	};

	const action = visualization ? "Update" : "Add";

	return (
		<FormProvider {...form}>
			<Modal position="middle" onClose={onClose} hide={hide}>
				<ModalTitle>
					{i18n.t("{{action}} visualization", { action })}
				</ModalTitle>
				<ModalContent>
					<form className="flex flex-col gap-4">
						<RHFSingleSelectField
							required
							label={i18n.t("Type")}
							options={[
								{
									label: i18n.t("Visualization"),
									value: VisualizationDisplayItemType.CHART,
								},
								{
									label: i18n.t("Map"),
									value: VisualizationDisplayItemType.MAP,
								},
							]}
							name="type"
						/>
						<VisualizationSelector />
						<RHFTextAreaField
							name="caption"
							label={i18n.t("Caption")}
						/>
					</form>
				</ModalContent>
				<ModalActions>
					<ButtonStrip>
						<Button onClick={onClose}>{i18n.t("Cancel")}</Button>
						<Button
							primary
							onClick={(_, e) => form.handleSubmit(onAdd)(e)}
						>
							{action}
						</Button>
					</ButtonStrip>
				</ModalActions>
			</Modal>
		</FormProvider>
	);
}
