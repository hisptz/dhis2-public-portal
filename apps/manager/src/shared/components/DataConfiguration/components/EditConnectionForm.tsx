import { FormProvider, useForm, useFormContext } from "react-hook-form";
import { DataServiceConfig } from "@packages/shared/schemas";
import React, { useEffect } from "react";
import { z, ZodIssueCode } from "zod";
import {
	Button,
	ButtonStrip,
	Modal,
	ModalActions,
	ModalContent,
	ModalTitle,
	CircularLoader,
} from "@dhis2/ui";
import i18n from "@dhis2/d2-i18n";
import { RHFTextInputField } from "@hisptz/dhis2-ui";
import { AuthFields } from "./AuthFields";
import { TestConnection } from "./TestConnection";
import { testDataSource } from "../utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateConnection } from "../hooks/save";
import { useWatch } from "react-hook-form";
import { useRoute } from "../hooks/useRoute";

const editConnectionFormSchema = z
	.object({
		source: z
			.object({
				name: z.string(),
				url: z.string().url(),
				pat: z.string().optional(),
				username: z.string().optional(),
				password: z.string().optional(),
				routeId: z.string(),
			})
			.superRefine((data, context) => {
				const hasAnyCred = !!data.pat || !!data.username || !!data.password;
				
				if (hasAnyCred) {
					if (!(!!data.pat || (!!data.username && !!data.password))) {
						if (!data.pat) {
							context.addIssue({
								code: ZodIssueCode.custom,
								message: i18n.t(
									"Please provide either a PAT or both username and password",
								),
								path: ["pat"],
							});
						}
						if (!data.username || !data.password) {
							context.addIssue({
								code: ZodIssueCode.custom,
								message: i18n.t(
									"Please provide either a PAT or both username and password",
								),
								path: ["username"],
							});
						}
					}
				}
			}),
	})
	.superRefine(async (data, context) => {
		const hasCredentials = !!data.source.pat || (!!data.source.username && !!data.source.password);
		
		if (hasCredentials) {
			try {
				const response = await testDataSource({
					url: data.source.url,
					pat: data.source.pat,
					username: data.source.username,
					password: data.source.password,
				});
				if (response.status !== 200) {
					context.addIssue({
						code: ZodIssueCode.custom,
						message: i18n.t(
							"Could not connect to the DHIS2 instance. Please check the URL, and authentication, and try again.",
						),
						path: ["source", "url"],
					});
				}
			} catch (error) {
				context.addIssue({
					code: ZodIssueCode.custom,
					message: i18n.t(
						"Could not connect to the DHIS2 instance. Please check the URL, and authentication, and try again.",
					),
					path: ["source", "url"],
				});
			}
		}
	});

export type EditConnectionFormValues = z.infer<typeof editConnectionFormSchema>;

export function EditConnectionForm({
	hide,
	onClose,
}: {
	hide: boolean;
	onClose: () => void;
}) {
	const parentForm = useFormContext<DataServiceConfig>();
	
	const currentSource = useWatch<DataServiceConfig, "source">({
		name: "source",
	});

	const { loading, route, refetch } = useRoute(currentSource?.routeId);

	const form = useForm<EditConnectionFormValues>({
		resolver: zodResolver(editConnectionFormSchema),
		defaultValues: {
			source: {
				name: currentSource?.name || "",
				url: "",
				routeId: currentSource?.routeId || "",
				pat: "",
				username: "",
				password: "",
			},
		},
	});

	useEffect(() => {
		if (route?.url) {
			const cleanUrl = route.url.replace("/api/**", "");
			form.setValue("source.url", cleanUrl);
		}
	}, [route, form]);

	const { updateConnection } = useUpdateConnection();

	const onSubmit = async (data: EditConnectionFormValues) => {
		await updateConnection(
			{
				name: data.source.name,
				url: data.source.url,
				pat: data.source.pat || undefined,
				username: data.source.username || undefined,
				password: data.source.password || undefined,
				routeId: currentSource.routeId,
			},
			{
				onSuccess: (updatedConfig) => {
					parentForm.setValue("source.name", updatedConfig.source.name);
					refetch();
				},
			}
		);
		onClose();
	};

	if (loading) {
		return (
			<Modal position="middle" onClose={onClose} hide={hide}>
				<ModalTitle>{i18n.t("Edit connection")}</ModalTitle>
				<ModalContent>
					<div className="flex justify-center items-center py-8">
						<CircularLoader />
					</div>
				</ModalContent>
			</Modal>
		);
	}

	return (
		<FormProvider {...form}>
			<Modal position="middle" onClose={onClose} hide={hide}>
				<ModalTitle>{i18n.t("Edit connection")}</ModalTitle>
				<ModalContent>
					<form className="flex flex-col gap-2">
						<RHFTextInputField
							label={i18n.t("Name")}
							name="source.name"
							placeholder={"DHIS2 Playground"}
							required
						/>
						<RHFTextInputField
							label={i18n.t("URL")}
							name="source.url"
							placeholder={"https://play.dhis2.org"}
							required
						/>
						<div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
							<p className="font-semibold mb-1">
								{i18n.t("Update Authentication (Optional)")}
							</p>
							<p>
								{i18n.t(
									"Credentials are already set. Only fill these fields if you want to update them."
								)}
							</p>
						</div>
						<AuthFields />
						<TestConnection />
					</form>
				</ModalContent>
				<ModalActions>
					<ButtonStrip>
						<Button onClick={onClose}>{i18n.t("Cancel")}</Button>
						<Button
							loading={
								form.formState.isSubmitting ||
								form.formState.isValidating
							}
							onClick={(_, e) => form.handleSubmit(onSubmit)(e)}
							primary
						>
							{form.formState.isValidating
								? i18n.t("Validating...")
								: form.formState.isSubmitting
									? i18n.t("Saving...")
									: i18n.t("Save")}
						</Button>
					</ButtonStrip>
				</ModalActions>
			</Modal>
		</FormProvider>
	);
}
