import {
    Button,
    ButtonStrip,
    Modal,
    ModalActions,
    ModalContent,
    ModalTitle,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import { FormProvider, useForm } from "react-hook-form";
import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { DashboardGroupIDField } from "./DashboardGroupIDField";
import { VisualizationGroup, visualizationGroupSchema } from "@packages/shared/schemas";

export function AddGroupForm({
	sortOrder,
    hide,
    onClose,
    onAdd,
}: {
	sortOrder: number;	
    hide: boolean;
    onClose: () => void;
    onAdd: (group: VisualizationGroup) => void;
}) {
    const form = useForm<VisualizationGroup>({
        resolver: zodResolver(visualizationGroupSchema),
        defaultValues: {
            description: "",
			shortName: "",
            shortDescription: "",
			items: [],
            layouts: {
                lg: [],
                md: [],
                sm: [],
                xs: [],
            },
			sortOrder,
            highlights: [],
        },
    });

    const onSubmit = (data: VisualizationGroup) => {
        onAdd(data);
        onClose();
    };

    

    return (
        <FormProvider {...form}>
            <Modal position="middle" onClose={onClose} hide={hide}>
                <ModalTitle>{i18n.t("Create Dashboard Group")}</ModalTitle>
                <ModalContent>
                    <form className="flex flex-col gap-4">
                        <RHFTextInputField
                            required
                            name="title"
                            label={i18n.t("Title")}
                        />
                        <RHFTextInputField
                            required
                            name="shortName"
                            label={i18n.t("Short Name")}
                        />
                        <DashboardGroupIDField />
                    </form>
                </ModalContent>
                <ModalActions>
                    <ButtonStrip>
                        <Button onClick={onClose}>{i18n.t("Cancel")}</Button>
                        <Button
                            loading={form.formState.isSubmitting}
                            primary
                            onClick={(_, e) => form.handleSubmit(onSubmit)(e)}
                        >
                            {form.formState.isSubmitting
                                ? i18n.t("Creating...")
                                : i18n.t("Create group")}
                        </Button>
                    </ButtonStrip>
                </ModalActions>
            </Modal>
        </FormProvider>
    );
}