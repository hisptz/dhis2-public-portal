import {
 	MenuItem,
	menuItemSchema,
 } from "@packages/shared/schemas";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	Button,
	ButtonStrip,
	CircularLoader,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import React from "react";
import { useDialog } from "@hisptz/dhis2-ui";
  import { z } from "zod";
 
export interface MenuItemFormProps {
	onClose(): void;
	items: MenuItem[];
	onSubmit(data: MenuItem): void;
	config?: MenuItem;
	sortOrder?: number;
	hide: boolean;
}

 
export function SortManual({
	config,
	items,
	onClose,
	onSubmit,
	hide,
}: MenuItemFormProps) {
 	const { confirm } = useDialog();
 
	const form = useForm<MenuItem>({
		resolver: zodResolver(menuItemSchema),
		defaultValues: {},
		shouldFocusError: false,
	});


	const onSave = async (data: MenuItem) => {
		const updatedData = {
			...data,
			icon: config?.icon,
		};
 
		onSubmit(menuItemSchema.parse(updatedData));
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
					{i18n.t("Sort menu item")}
				</ModalTitle>
				<ModalContent>
					{form.formState.isLoading ? (
						<div className="w-full h-[400px] flex items-center justify-center">
							<CircularLoader small />
						</div>
					) : (
						<form className="flex flex-col gap-2">
 						
 						</form>
					)}
				</ModalContent>
				<ModalActions>
					<ButtonStrip>
						<Button onClick={onCloseClick}>
							{i18n.t("Cancel")}
						</Button>
						<Button
							loading={form.formState.isSubmitting}
							onClick={() => form.handleSubmit(onSave)()}
							primary
						>
							{form.formState.isSubmitting
								? i18n.t("Saving changes...")
								: i18n.t("Save")}
						</Button>
					</ButtonStrip>
				</ModalActions>
			</Modal>
		</FormProvider>
	);
}
