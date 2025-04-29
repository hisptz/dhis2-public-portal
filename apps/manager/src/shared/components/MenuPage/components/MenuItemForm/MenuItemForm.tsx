import {
	MenuItem,
	menuItemSchema,
	MenuItemType,
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
import i18n from "@dhis2/d2-i18n";
import React from "react";
import { useDialog } from "@hisptz/dhis2-ui";
import { MenuTypeSelector } from "./MenuTypeSelector";
import { MenuTypeInput } from "./MenuTypeInput";

export interface MenuItemFormProps {
	onClose(): void;

	onSubmit(data: MenuItem): void;

	config?: MenuItem;
	sortOrder?: number;
	hide: boolean;
}

export function MenuItemForm({
	config,
	sortOrder,
	onClose,
	onSubmit,
	hide,
}: MenuItemFormProps) {
	const { confirm } = useDialog();
	const form = useForm<MenuItem>({
		resolver: zodResolver(menuItemSchema),
		defaultValues: config ?? {
			sortOrder,
			type: MenuItemType.MODULE,
		},
		shouldFocusError: false,
	});

	const action = config ? i18n.t("Update") : i18n.t("Create");

	const onSave = (data: MenuItem) => {
		onSubmit(data);
		form.reset();
		onClose();
	};

	const onCloseClick = () => {
		if (form.formState.isDirty) {
			confirm({
				title: i18n.t("Confirm exit"),
				message: i18n.t(
					"Are you sure you want to close this form?. All changes will be lost",
				),
				onConfirm() {
					onClose();
				},
			});
		} else {
			onClose();
		}
	};

	return (
		<FormProvider {...form}>
			<Modal position="middle" hide={hide} onClose={onCloseClick}>
				<ModalTitle>
					{action}
					{i18n.t(" menu item", {
						context: "Follows either create or update",
					})}
				</ModalTitle>
				<ModalContent>
					<form className="flex flex-col gap-2">
						<MenuTypeInput />
						<MenuTypeSelector />
					</form>
				</ModalContent>
				<ModalActions>
					<ButtonStrip>
						<Button onClick={onCloseClick}>
							{i18n.t("Cancel")}
						</Button>
						<Button
							onClick={() => form.handleSubmit(onSave)()}
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
