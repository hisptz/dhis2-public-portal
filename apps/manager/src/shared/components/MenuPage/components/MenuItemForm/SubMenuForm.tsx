import {
	MenuItemType,
	ModuleMenuItem,
	moduleMenuItemSchema,
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
import { ModuleSelector } from "./ModuleSelector";
import { SubMenuDataInput } from "./SubMenuDataInput";

export interface SubMenuFormProps {
	onClose(): void;

	onSubmit(menu: ModuleMenuItem): void;

	hide: boolean;
	menu?: ModuleMenuItem;
	sortOrder?: number;
	parentPath: string;
}

export function SubMenuForm({
	menu,
	sortOrder,
	onClose,
	onSubmit,
	hide,
	parentPath,
}: SubMenuFormProps) {
	const form = useForm<ModuleMenuItem>({
		resolver: zodResolver(moduleMenuItemSchema),
		defaultValues: menu ?? {
			sortOrder,
			type: MenuItemType.MODULE,
		},
		shouldFocusError: false,
	});

	const action = menu ? i18n.t("Update") : i18n.t("Create");

	const onSave = (data: ModuleMenuItem) => {
		onSubmit(data);
		form.reset();
		onClose();
	};

	return (
		<FormProvider {...form}>
			<Modal small position="middle" hide={hide} onClose={onClose}>
				<ModalTitle>
					{action}
					{i18n.t(" sub menu item")}
				</ModalTitle>
				<ModalContent>
					<form className="flex flex-col gap-2">
						<ModuleSelector subMenu />
						<SubMenuDataInput parentPath={parentPath} />
					</form>
				</ModalContent>
				<ModalActions>
					<ButtonStrip>
						<Button onClick={onClose}>{i18n.t("Cancel")}</Button>
						<Button
							onClick={(_, e) => form.handleSubmit(onSave)(e)}
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
