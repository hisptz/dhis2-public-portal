import { useBoolean } from "usehooks-ts";
import { AddFeedbackForm } from "./AddFeedbackForm";
import { Button, IconEdit16 } from "@dhis2/ui";
import React from "react";
 import i18n from "@dhis2/d2-i18n";
import { FeedbackConfig } from "@packages/shared/schemas";

export function EditFeedback({
	onUpdate,
	feedback,
}: {
	onUpdate: (data: FeedbackConfig) => void;
	feedback: FeedbackConfig;
}) {
	const { value: hide, setTrue: onHide, setFalse: onShow } = useBoolean(true);

	return (
		<>
			{!hide && (
				<AddFeedbackForm
					feedback={feedback}
					hide={hide}
					onClose={onHide}
					onSubmit={onUpdate}
				/>
			)}
			<Button
				title={i18n.t("Edit feedback")}
				onClick={onShow}
				icon={<IconEdit16 />}
			/>
		</>
	);
}
