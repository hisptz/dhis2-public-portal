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
import { footerItemConfig, FooterItemConfig } from "@packages/shared/schemas";
import { FooterLinksInput } from "../FooterLink/FooterLinksInput";
import { RHFRichTextAreaField } from "../../../../Fields/RHFRichTextAreaField";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RHFSingleSelectField, RHFTextInputField } from "@hisptz/dhis2-ui";

type Props = {
	onAdd: (data: FooterItemConfig) => void;
	onClose: () => void;
	hide: boolean;
	config?: FooterItemConfig;
};

export function FooterItemForm({ onAdd, onClose, hide, config }: Props) {
	const form = useForm<FooterItemConfig>({
		defaultValues: config,
		resolver: zodResolver(footerItemConfig),
	});

	const type = form.watch("type");

	return (
		<FormProvider {...form}>
			<form className="flex flex-col gap-2">
				<Modal hide={hide} position="middle">
					<ModalTitle>
						{config ? "Update Footer Item" : "Add Footer Item"}
					</ModalTitle>
					<ModalContent>
						<div className="flex flex-col gap-2">
							<RHFTextInputField
								name="title"
								label={i18n.t("Title")}
								required
							/>
							<RHFSingleSelectField
								options={
									[
										{
											label: i18n.t("Links"),
											value: "links",
										},
										{
											label: i18n.t("Static Content"),
											value: "static",
										},
									] as const
								}
								name="type"
								label={i18n.t("Type")}
								required
							/>

							{type === "links" && (
								<FooterLinksInput name="links" />
							)}
							{type === "static" && (
								<RHFRichTextAreaField
									name="staticContent"
									label={i18n.t("Static Content")}
								/>
							)}
						</div>
					</ModalContent>

					<ModalActions>
						<ButtonStrip>
							<Button secondary onClick={onClose}>
								{i18n.t("Cancel")}
							</Button>
							<Button
								primary
								type="submit"
								disabled={!form.formState.isValid}
								onClick={() => {
									form.handleSubmit((data) => {
										onAdd(data);
										onClose();
									})();
								}}
							>
								{config ? i18n.t("Update") : i18n.t("Add")}
							</Button>
						</ButtonStrip>
					</ModalActions>
				</Modal>
			</form>
		</FormProvider>
	);
}
