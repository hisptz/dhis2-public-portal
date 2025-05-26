"use server";

import { dhis2HttpClient } from "@/utils/api/dhis2";
import {  FeedbackConfig, FeedbackItem } from "@packages/shared/schemas";

interface SendEmailResponse { }

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
		return await dhis2HttpClient.postFeedback<SendEmailResponse>(
			url,
			{},
			{ params: searchParams },
		);
	} catch (e) {
		console.log(e);
		throw "Could not send email";
	}
}

export async function sendFeedbackEmail({ data, item }: { data: FeedbackConfig, item: FeedbackItem }) {

	const recipients = Array.isArray(item?.recipients) && item.recipients.length > 0
		? item.recipients.map((recipient) => recipient.email).filter((email) => typeof email === "string")
		: [];


	if (recipients.length === 0) {
		throw new Error("No valid feedback email recipients configured");
	}


	const subject = `Feedback from ${data.name}`;
	const message = `A feedback from ${data.name} has been submitted.
  					Name: ${data.name}
  					Email: ${data.email}
  					Message: ${data.message}
  					`;

	return await sendEmail({ subject, message, recipients });
}