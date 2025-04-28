import i18n from "@dhis2/d2-i18n";
import { Accordion, Divider, Title } from "@mantine/core";
import { getAppConfig } from "@/utils/config/appConfig";
import { FaqData } from "@packages/shared/schemas";
import { groupBy } from "lodash";

export default async function FaqPage() {
	const faqs = await getAppConfig<FaqData[]>("faq");
	const categories = groupBy(faqs, "category");

	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="flex flex-col gap-2">
				<Title
					order={2}
					className=" text-lg text-primary-400  font-bold"
				>
					{i18n.t("FAQs")}
				</Title>
				<Divider />
			</div>
			<div>
				{Object.keys(categories).map((category, index) => {
					const value = categories[category];
					return (
						<Accordion
							defaultValue={`accordion-item-0`}
							key={`${category}-accordion`}
						>
							<Accordion.Item
								key={`${category}-accordion-item-${index}`}
								value={`accordion-item-${index}`}
							>
								<Accordion.Control>
									<span className="font-bold text-gray-500">
										{category}
									</span>
								</Accordion.Control>
								<Accordion.Panel>
									{value.map((faq) => (
										<div
											key={`${faq.question}-area`}
											className="flex flex-col gap-4 w-full pt-4 pb-4"
										>
											<h4 className="m-0 font-bold">
												{faq.question}
											</h4>
											<span className="text-justify border-l-8 border-l-gray-300 p-1">
												{faq.answer}
											</span>
										</div>
									))}
								</Accordion.Panel>
							</Accordion.Item>
						</Accordion>
					);
				})}
			</div>
		</div>
	);
}
