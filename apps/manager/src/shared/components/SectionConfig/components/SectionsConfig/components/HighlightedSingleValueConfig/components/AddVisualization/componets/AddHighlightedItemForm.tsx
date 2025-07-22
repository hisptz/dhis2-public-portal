import { FormProvider, useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
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
import { VisualizationSelector } from "./VisualizationSelector";
import {
	AppIconFile,
	highlightedSingleValue,
	HighlightedSingleValueConfig,
} from "@packages/shared/schemas";
import { z } from "zod";
import { RHFIconInput } from "../../../../../../../../Fields/RHFIconInput";
import { set } from "lodash";
import { useDataEngine } from "@dhis2/app-runtime";
import { useManageDocument } from "../../../../../../../../../hooks/document";

const fileQuery = {
	icon: {
		resource: `documents`,
		id: ({ icon }) => icon,
	},
};

const formHighlightedSingleValueSchema = highlightedSingleValue.extend({
	icon: z.instanceof(AppIconFile, { message: i18n.t("Icon is required") }),
});

type FormHighlightedSingleValueDisplayItem = z.infer<
	typeof formHighlightedSingleValueSchema
>;

export function AddHighlightedItemForm({
	visualization,
	hide,
	onClose,
	onSubmit,
}: {
	visualization?: HighlightedSingleValueConfig;
	hide: boolean;
	onClose: () => void;
	onSubmit: (visualization: HighlightedSingleValueConfig) => void;
}) {
	const engine = useDataEngine();
	const { create: createIcon } = useManageDocument();
	const form = useForm<FormHighlightedSingleValueDisplayItem>({
		resolver: zodResolver(formHighlightedSingleValueSchema),
		shouldFocusError: false,
		defaultValues: async () => {
			if (!visualization) {
				return {} as FormHighlightedSingleValueDisplayItem;
			}
			const file = visualization.icon
				? ((await engine.query(fileQuery, {
						variables: {
							icon: visualization.icon,
						},
					})) as { icon: { displayName: string; id: string } })
				: undefined;

			return {
				...visualization,
				icon: file
					? new AppIconFile(
							[],
							`${file?.icon?.displayName.replace(`[public-portal] `, ``)}`,
							{
								type: "image/png",
							},
						).setId(file.icon.id)
					: undefined,
			} as FormHighlightedSingleValueDisplayItem;
		},
	});

	const onAdd = async (data: FormHighlightedSingleValueDisplayItem) => {
		const updatedData = {
			...data,
			icon: visualization?.icon,
		};

		if ((data.icon?.size ?? 0) > 0) {
			const iconId = await createIcon(data.icon!);
			set(updatedData, "icon", iconId);
		}
		onSubmit(highlightedSingleValue.parse(updatedData));
		form.reset();
		onClose();
	};

	const action = visualization ? "Update" : "Add";

	return (
		<FormProvider {...form}>
			<Modal position="middle" onClose={onClose} hide={hide}>
				<ModalTitle>
					{i18n.t("{{action}} highlighted item", { action })}
				</ModalTitle>
				<ModalContent>
					{form.formState.isLoading ? (
						<div className="flex justify-center items-center h-full min-h-[300px]">
							<CircularLoader small />
						</div>
					) : (
						<form className="flex flex-col gap-4">
							<VisualizationSelector />
							<RHFIconInput
								label={i18n.t("Icon")}
								name={"icon"}
								accept={"image/*"}
							/>
						</form>
					)}
				</ModalContent>
				<ModalActions>
					<ButtonStrip>
						<Button onClick={onClose}>{i18n.t("Cancel")}</Button>
						<Button
							dataTest={"add-highlighted-item-button"}
							loading={form.formState.isSubmitting}
							primary
							onClick={(_, e) => form.handleSubmit(onAdd)(e)}
						>
							{form.formState.isSubmitting
								? i18n.t("Uploading ...")
								: action}
						</Button>
					</ButtonStrip>
				</ModalActions>
			</Modal>
		</FormProvider>
	);
}
