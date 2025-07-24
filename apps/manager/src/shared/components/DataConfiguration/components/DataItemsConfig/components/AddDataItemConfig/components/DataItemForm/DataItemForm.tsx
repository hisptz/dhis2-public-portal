import {
	dataItemConfigSchema,
	DataServiceDataItemConfig,
} from "@packages/shared/schemas";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	ButtonStrip,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
} from "@dhis2/ui";
import React from "react";
import i18n from "@dhis2/d2-i18n";
import { RHFTextInputField } from "@hisptz/dhis2-ui";

export function DataItemForm({
	hide,
	onClose,
	onSubmit,
	data,
}: {
	hide: boolean;
	onClose: () => void;
	onSubmit: (data: DataServiceDataItemConfig) => void;
	data?: DataServiceDataItemConfig;
}) {
	const form = useForm<DataServiceDataItemConfig>({
		resolver: zodResolver(dataItemConfigSchema),
	});

	const action = data ? i18n.t("Update") : i18n.t("Create");

	return (
		<FormProvider {...form}>
			<Modal small hide={hide} onClose={onClose} position="middle">
				<ModalTitle>{`${action} data item`}</ModalTitle>
				<ModalContent>
					<form className="flex flex-col gap-2">
						<RHFTextInputField
							required
							name="sourceId"
							label={i18n.t("Source ID")}
							helpText={i18n.t(
								"A valid analytics dimension item from the source (data element, data element and category option)",
							)}
						/>
						<RHFTextInputField
							required
							helpText={i18n.t(
								"A valid analytics dimension item (data element, data element and category option)",
							)}
							name="id"
							label={i18n.t("ID")}
						/>
					</form>
				</ModalContent>
				<ModalActions>
					<ButtonStrip>
						<Button onClick={onClose}>{i18n.t("Cancel")}</Button>
						<Button
							onClick={(_, e) => {
								form.handleSubmit(onSubmit)(e);
								onClose();
							}}
							primary
						>
							{action}
						</Button>
					</ButtonStrip>
				</ModalActions>
			</Modal>
		</FormProvider>
	);
}
