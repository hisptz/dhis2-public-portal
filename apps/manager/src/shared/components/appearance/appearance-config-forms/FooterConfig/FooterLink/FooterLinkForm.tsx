import React from "react";
import { FooterLink, footerLinkSchema } from "@packages/shared/schemas";
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
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import i18n from "@dhis2/d2-i18n";

type Props = {
	onAdd: (data: FooterLink) => void;
	onClose: () => void;
	hide: boolean;
	config?: FooterLink;
};

export function FooterLinkForm({ onAdd, onClose, hide, config }: Props) {
	const form = useForm<FooterLink>({
		resolver: zodResolver(footerLinkSchema),
		defaultValues: config,
	});

	return (
		<FormProvider {...form}>
			<form className="flex flex-col gap-2">
				<Modal hide={hide} small position="middle">
					<ModalTitle>
						{config ? "Update Footer Link" : "Add Footer Link"}
					</ModalTitle>
					<ModalContent>
						<RHFTextInputField label="Name" name="name" required data-test="footer-link-name-input" />
						<RHFTextInputField
							label="Link URL"
							name="url"
							required
							data-test="footer-link-url-input"
						/>
					</ModalContent>
					<ModalActions>
						<ButtonStrip>
							<Button secondary onClick={onClose} data-test="footer-link-cancel-button">
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
								data-test="footer-link-add-button"
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
