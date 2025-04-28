"use server";

import { dhis2HttpClient } from "@/utils/api/dhis2";
import { Feedback } from "@packages/shared/schemas";
import { getAppConfig } from "@/utils/config/appConfig";

interface SendEmailResponse {}

export async function sendEmail({
	subject,
	message,
	recipients,
}: {
	subject: string;
	message: string;
	recipients: string[];
}) {
	const url = `email/notification`;
	const searchParams = {
		recipients: recipients.join(","),
		subject,
		message,
	};
	try {
		return await dhis2HttpClient.post<SendEmailResponse>(
			url,
			{},
			{ params: searchParams },
		);
	} catch (e) {
		console.log(e);
		throw "Could not send email";
	}
}

export async function sendFeedbackEmail({ data }: { data: Feedback }) {
	const emailConfig = await getAppConfig<{ emails: string[] }>(
		"feedback-emails",
	);
	const recipients = emailConfig?.emails;
	const subject = `Feedback from ${data.name}`;
	const message = `A feedback from ${data.name} has been submitted at the Tanzania Health Portal. 
	
	Name: ${data.name}
	Email: ${data.email}
	Message: ${data.message}
	`;

	return await sendEmail({ subject, message, recipients });
}
