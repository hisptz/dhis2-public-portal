"use client";

import i18n from "@dhis2/d2-i18n";
import { Button } from "@mantine/core";
import { IconInfoCircle } from "@tabler/icons-react";
import { useCallback, useRef } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Feedback, feedbackSchema } from "@packages/shared/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { RHFTextField } from "@/components/RHFTextField";
import { sendFeedbackEmail } from "@/utils/sendEmail";

export default function FeedbackPage() {
	const form = useForm<Feedback>({
		resolver: zodResolver(feedbackSchema),
		reValidateMode: "onChange",
	});
	const formRef = useRef<HTMLFormElement>(null);
	const onFormSubmit = useCallback(async (data: Feedback) => {
		try {
			await sendFeedbackEmail({ data });
			window.alert(`Feedback sent successfully.`);
		} catch (e) {
			window.alert(`Error sending feedback. Try again later.`);
		}
	}, []);
	const handleCancel = async () => {
		form.reset();
	};

	return (
		<FormProvider {...form}>
			<div className="flex flex-col gap-8 p-4">
				<div className="flex flex-col gap-4 w-full h-full">
					<div
						style={{
							border: "1px solid #C5E3FC",
							background: "background: #F5FBFF",
						}}
						className="flex gap-4 p-2"
					>
						<IconInfoCircle color="#093371" />
						<div className="flex flex-col gap-2">
							<h4
								style={{ color: "#212934" }}
								className="font-bold"
							>
								{i18n.t("Information")}
							</h4>
							<span>
								{i18n.t(
									"Have any feedback, suggestion, or question? We would love to hear from you.",
								)}
							</span>
						</div>
					</div>
				</div>
				<form
					onSubmit={form.handleSubmit(onFormSubmit)}
					ref={formRef}
					className="flex flex-col gap-4"
				>
					<RHFTextField
						name="email"
						type="email"
						fullWidth
						size="medium"
						variant="outlined"
						label={i18n.t("Email")}
					/>
					<RHFTextField
						name="name"
						type="text"
						fullWidth
						size="medium"
						variant="outlined"
						label={i18n.t("Full name")}
					/>
					<RHFTextField
						name="message"
						required
						rows={6}
						type="text"
						multiline
						size="medium"
						variant="outlined"
						label={i18n.t("Question or feedback")}
					/>
				</form>
				<div className="flex gap-2 justify-end align-center">
					<Button onClick={handleCancel} variant="outlined">
						{i18n.t("Cancel")}
					</Button>

					<Button
						onClick={() => {
							if (formRef.current) {
								formRef.current?.requestSubmit();
							}
						}}
						variant="outlined"
					>
						{form.formState.isSubmitting
							? i18n.t("Sending feedback...")
							: i18n.t("Send feedback")}
					</Button>
				</div>
			</div>
		</FormProvider>
	);
}
