import { Card, NavLink, Title } from "@mantine/core";
import { NewsData } from "@packages/shared/schemas";
import Image from "next/image";
import { snakeCase } from "lodash";
import Link from "next/link";
import i18n from "@dhis2/d2-i18n";

export function NewsCard({ news }: { news: NewsData }) {
	const link = `/news-and-updates/${news.id}`;

	const formatDate = Intl.DateTimeFormat("en-GB", {
		dateStyle: "full",
	}).format;
	const formatedDate = formatDate(new Date(news.date));

	return (
		<Card
			href={link}
			component={Link}
			className="hover:border-gray-200 border-2 border-transparent"
		>
			<div className="flex flex-col gap-2 w-full h-full">
				{news.image && (
					<Image alt={snakeCase(news.title)} src={news.image} />
				)}
				<div className="flex flex-col justify-between p-4 h-full gap-4">
					<div className=" flex flex-col gap-2 flex-1">
						<Title
							className="font-bold text-primary-400 text-xl"
							order={2}
						>
							{news.title}
						</Title>
						<p className="text-base">
							{news.summary}
							&nbsp;
							<NavLink
								className="text-primary-400 underline"
								color="primary"
								href={link}
								component={Link}
							>
								{i18n.t("Read more")}
							</NavLink>
						</p>
					</div>
					<span className="text-gray-500 text-sm">
						{formatedDate}
					</span>
				</div>
			</div>
		</Card>
	);
}
