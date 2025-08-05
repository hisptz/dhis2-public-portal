import React, { useMemo, useState } from "react";
import {
	appAppearanceConfig,
	AppAppearanceConfig,
	AppIconFile,
	HeaderConfig,
	logoConfig,
} from "@packages/shared/schemas";
import { useAlert } from "@dhis2/app-runtime";
import { useUpdateDatastoreEntry } from "../../../hooks/datastore";
import {
	APP_NAMESPACE,
	APPEARANCE_CONFIG_KEY,
} from "../../../constants/datastore";

import {
	FieldErrors,
	FormProvider,
	SubmitErrorHandler,
	useForm,
	useFormContext,
	useFormState,
} from "react-hook-form";
import i18n from "@dhis2/d2-i18n";
import { z } from "zod";
import {
	Button,
	ButtonStrip,
	IconChevronDown16,
	IconChevronUp16,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
} from "@dhis2/ui";
import { StyleConfig } from "./components/AdvancedHeaderConfig/components/StyleConfig";
import { LogoConfig } from "./components/AdvancedHeaderConfig/components/LogoConfig";
import { TitleConfig } from "./components/AdvancedHeaderConfig/components/TitleConfig";
import { zodResolver } from "@hookform/resolvers/zod";
import { HeaderStyleConfig } from "./components/AdvancedHeaderConfig/components/HeaderStyleConfig";
import { useManageDocument } from "../../../hooks/document";
import { isEmpty, set } from "lodash";

type props = {
	configurations: AppAppearanceConfig;
	onClose: () => void;
	onComplete: () => void;
};

const appearanceConfigFromData = appAppearanceConfig.extend({
	header: appAppearanceConfig.shape.header.extend({
		style: appAppearanceConfig.shape.header.shape.style.extend({
			trailingLogo: logoConfig
				.extend({
					url: z.instanceof(AppIconFile).optional(),
				})
				.optional(),
			leadingLogo:
				appAppearanceConfig.shape.header.shape.style.shape.leadingLogo.optional(),
		}),
	}),
});

export type AppearanceConfigFormData = z.infer<typeof appearanceConfigFromData>;

function SaveButton({ onComplete, configurations, onClose }: props) {
	const form = useFormState();
	const { handleSubmit } = useFormContext();
	const { show: showAlert } = useAlert(
		({ message }) => message,
		({ type }) => ({ ...type, duration: 3000 }),
	);

	const { create: createIcon } = useManageDocument();

	const { update, error } = useUpdateDatastoreEntry({
		namespace: APP_NAMESPACE,
	});

	const buttonLabel = useMemo(() => {
		if (form.isSubmitting) {
			return i18n.t("Updating...");
		}
		return i18n.t("Update");
	}, [form.isSubmitting]);

	const onError: SubmitErrorHandler<HeaderConfig> = (
		errors: FieldErrors<HeaderConfig>,
	) => {
		console.error(errors);
		showAlert({
			message: i18n.t(
				"Could not save form. Fix the form errors fist and try again",
			),
			type: { critical: true },
		});
	};

	const onUpdateConfiguration = async (data: AppearanceConfigFormData) => {
		try {
			const updatedConfig = {
				...configurations,
				...data,
			};
			const trailingLogo = data.header.style.trailingLogo?.url;

			if (trailingLogo) {
				if ((data.header.style.trailingLogo?.url?.size ?? 0) > 0) {
					const iconId = await createIcon(trailingLogo);
					set(
						updatedConfig,
						["header", "style", "trailingLogo", "url"],
						iconId,
					);
				} else {
					set(
						updatedConfig,
						["header", "style", "trailingLogo", "url"],
						data.header.style.trailingLogo?.url?.id,
					);
				}
			}

			await update({
				key: APPEARANCE_CONFIG_KEY,
				data: {
					...updatedConfig,
				},
			});
			if (error) {
				showAlert({
					message: i18n.t(
						`Error updating header configurations. ${error.message}`,
					),
					type: { critical: true },
				});
			} else {
				showAlert({
					message: i18n.t(
						"Header configurations updated successfully",
					),
					type: { success: true },
				});
			}
			onComplete();
			onClose();
		} catch (error: any) {
			console.error(error);
			showAlert({
				message: i18n.t("Error updating header configurations"),
				type: { critical: true },
			});
		}
	};

	return (
		<Button
			disabled={!form.isDirty || form.isSubmitting}
			loading={form.isSubmitting}
			onClick={(_, e) => {
				handleSubmit(onUpdateConfiguration, onError)(e);
			}}
			primary
		>
			{buttonLabel}
		</Button>
	);
}

export function HeaderConfigForm({
	configurations,
	onClose,
	onComplete,
}: props) {
	const [showAdvanced, setShowAdvances] = useState(false);

	const form = useForm<AppearanceConfigFormData>({
		defaultValues: async () => {
			const fileUrl = configurations.header.style.trailingLogo?.url;
			if (isEmpty(fileUrl))
				return configurations as AppearanceConfigFormData;
			return {
				...configurations,
				header: {
					...configurations.header,
					style: {
						...configurations.header.style,
						trailingLogo: {
							...configurations.header.style.trailingLogo,
							url: new AppIconFile([], `${fileUrl}`).setId(
								fileUrl!,
							),
						},
					},
				},
			};
		},
		resolver: zodResolver(appearanceConfigFromData),
		mode: "onChange",
	});
	return (
		<FormProvider {...form}>
			<Modal position="middle" onClose={onClose} large>
				<ModalTitle data-test = "model-header-title" >{i18n.t("Header configurations")}</ModalTitle>
				<ModalContent>
					<form className="flex flex-col gap-2">
						{/*Title config*/}
						<TitleConfig />
						<hr className="border-gray-200 my-2" />

						{/*Leading logo*/}
						<LogoConfig
							logoType="leadingLogo"
							label={i18n.t("Leading logo")}
						/>

						{showAdvanced && (
							<>
								<hr className="border-gray-200 my-2" />

								{/*Trailing logo*/}
								<LogoConfig
									logoType="trailingLogo"
									label={i18n.t("Trailing logo")}
								/>
								<hr className="border-gray-200 my-2" />

								{/*Header style config*/}
								<HeaderStyleConfig />
								<hr className="border-gray-200 my-2" />

								{/*	title style*/}
								<StyleConfig
									label={i18n.t("Title styles")}
									parentName={"header.title.style"}
								/>
								<hr className="border-gray-200 my-2" />

								{/*	subtitle style*/}
								<StyleConfig
									label={i18n.t("Subtitle styles")}
									parentName={"header.subtitle.style"}
								/>
							</>
						)}

						{/*Advance Options toggle*/}
						<div
							onClick={() => setShowAdvances(!showAdvanced)}
							className="cursor-pointer text-gray-600 text-xs"
						>
							{showAdvanced ? (
								<div className="flex flex-row gap-1 items-center">
									<span>
										{i18n.t("Hide advanced options")}
									</span>
									<IconChevronUp16 />
								</div>
							) : (
								<div className="flex flex-row gap-1 items-center">
									<span>
										{i18n.t("Show advanced options")}
									</span>
									<IconChevronDown16 />
								</div>
							)}
						</div>
					</form>
				</ModalContent>
				<ModalActions>
					<ButtonStrip end>
						<Button onClick={onClose} secondary>
							{i18n.t("Cancel")}
						</Button>
						<SaveButton
							configurations={configurations}
							onClose={onClose}
							onComplete={onComplete}
							data-test="save-button"
							
						/>
					</ButtonStrip>
				</ModalActions>
			</Modal>
		</FormProvider>
	);
}
