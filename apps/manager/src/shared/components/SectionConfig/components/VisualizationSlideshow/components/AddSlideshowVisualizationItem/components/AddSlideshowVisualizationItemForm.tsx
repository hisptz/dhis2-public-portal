import React from "react";
import {
	SlideshowVisualization,
	slideshowVisualizationSchema,
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

type Props = {
	visualization?: SlideshowVisualization;
	hide: boolean;
	onClose: () => void;
	onSubmit: (slideshowVisualization: SlideshowVisualization) => void;
};

export function AddSlideshowVisualizationItemForm({
	hide,
	onClose,
	onSubmit,
	visualization,
}: Props) {
	const form = useForm<SlideshowVisualization>({
		resolver: zodResolver(slideshowVisualizationSchema),
		defaultValues: visualization,
		shouldFocusError: false,
	});

	const onAdd = (data: SlideshowVisualization) => {
		onSubmit(data);
		onClose();
	};

	const action = visualization ? "Update" : "Add";

	return (
		<FormProvider {...form}>
			<Modal position="middle" onClose={onClose} hide={hide}>
				<ModalTitle>
					{i18n.t("{{action}} slideshow visualization", { action })}
				</ModalTitle>
				<ModalContent>
					{/*	content here*/}
					form here!!
				</ModalContent>
				<ModalActions>
					<ButtonStrip>
						<Button onClick={onClose}>{i18n.t("Cancel")}</Button>
						<Button
							dataTest={"add-visualization-submit-button"}
							primary
							onClick={(_, e) => form.handleSubmit(onAdd)(e)}
						>
							{i18n.t(action)}
						</Button>
					</ButtonStrip>
				</ModalActions>
			</Modal>
		</FormProvider>
	);
}
