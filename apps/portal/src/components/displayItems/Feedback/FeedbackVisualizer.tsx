"use client";

import i18n from "@dhis2/d2-i18n";
import {
	Alert,
	Button,
	Group,
	Textarea,
	TextInput,
	useMantineTheme,
} from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useCallback, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
	FeedbackConfig,
	FeedbackItem,
	feedbackSchema,
} from "@packages/shared/schemas";

export default function FeedbackVisualizer({ item }: { item: FeedbackItem }) {
	const theme = useMantineTheme();

	const form = useForm({
		shouldFocusError: false,
		// @ts-expect-error zod issues
		resolver: zodResolver(feedbackSchema),
		reValidateMode: "onChange",
	});
	const formRef = useRef<HTMLFormElement>(null);

	const onFormSubmit = useCallback(
		async (data: FeedbackConfig) => {
			try {
				//   await sendFeedbackEmail({ data, item });
				form.reset();
				notifications.show({
					title: i18n.t("Success"),
					message: i18n.t("Feedback sent successfully"),
					color: "green",
				});
			} catch (e) {
				console.log("Error sending feedback:", e);
				const errorMessage =
					e instanceof Error
						? e.message
						: "Error sending feedback. Try again later.";
				notifications.show({
					title: i18n.t("Error"),
					message: i18n.t(errorMessage),
					color: "red",
				});
			}
		},
		[form, item],
	);

	const handleCancel = async () => {
		form.reset();
	};

	return (
		<FormProvider {...form}>
			<div className="flex flex-col gap-8 p-4">
				<div className="flex flex-col gap-4 w-full">
					<Alert
						icon={<IconInfoCircle size={24} />}
						color={theme.primaryColor}
						variant="light"
						title={i18n.t("Information")}
						styles={{
							root: {
								border: `1px solid ${theme.colors[theme.primaryColor][2]}`,
								backgroundColor:
									theme.colors[theme.primaryColor][0],
							},
							title: {
								color: theme.colors.gray[9],
								fontWeight: 700,
							},
							message: { color: theme.colors.gray[9] },
						}}
					>
						{i18n.t(
							"Have any feedback, suggestion, or question? We would love to hear from you.",
						)}
					</Alert>
				</div>
				<form
					onSubmit={form.handleSubmit(onFormSubmit)}
					ref={formRef}
					className="flex flex-col gap-4"
				>
					<TextInput
						{...form.register("email")}
						type="email"
						required
						label={i18n.t("Email")}
						size="md"
						styles={{
							input: {
								"border": `1px solid ${theme.colors.gray[4]}`,
								"&:focus": {
									borderColor:
										theme.colors[theme.primaryColor][5],
								},
							},
							label: { color: theme.colors.gray[9] },
						}}
					/>
					<TextInput
						{...form.register("name")}
						type="text"
						required
						label={i18n.t("Full name")}
						size="md"
						styles={{
							input: {
								"border": `1px solid ${theme.colors.gray[4]}`,
								"&:focus": {
									borderColor:
										theme.colors[theme.primaryColor][5],
								},
							},
							label: { color: theme.colors.gray[9] },
						}}
					/>
					<Textarea
						{...form.register("message")}
						label={i18n.t("Question or feedback")}
						required
						minRows={6}
						size="md"
						styles={{
							input: {
								"border": `1px solid ${theme.colors.gray[4]}`,
								"&:focus": {
									borderColor:
										theme.colors[theme.primaryColor][5],
								},
							},
							label: { color: theme.colors.gray[9] },
						}}
					/>
				</form>
				<Group justify="flex-end" gap="sm">
					<Button
						onClick={handleCancel}
						variant="outline"
						color={theme.colors.gray[6]}
						styles={{ root: { borderColor: theme.colors.gray[4] } }}
					>
						{i18n.t("Cancel")}
					</Button>
					<Button
						onClick={() => {
							if (formRef.current) {
								formRef.current?.requestSubmit();
							}
						}}
						variant="filled"
						color={theme.primaryColor}
						loading={form.formState.isSubmitting}
					>
						{form.formState.isSubmitting
							? i18n.t("Sending feedback...")
							: i18n.t("Send feedback")}
					</Button>
				</Group>
			</div>
		</FormProvider>
	);
}
