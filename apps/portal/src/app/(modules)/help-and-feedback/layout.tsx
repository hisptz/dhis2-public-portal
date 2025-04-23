import { ReactNode } from "react";
import { Card, Divider } from "@mantine/core";
import i18n from "@dhis2/d2-i18n";
import { PageTitle } from "@/components/PageTitle";

export default function HelpAndFeedbackPage({
	faq,
	feedback,
}: {
	faq: ReactNode;
	feedback: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-4 w-full h-full">
			<div>
				<PageTitle title={i18n.t("Help & Support")} />
				<Divider />
			</div>
			<div className="w-full h-full flex gap-4">
				<Card
					className="flex-1 border-2 border-transparent !rounded-[20px]"
					variant="elevation"
				>
					{faq}
				</Card>
				<Card
					className="flex-1 h-fit border-2 border-transparent !rounded-[20px]"
					variant="elevation"
				>
					{feedback}
				</Card>
			</div>
		</div>
	);
}
