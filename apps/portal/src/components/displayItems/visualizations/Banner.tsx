"use client";

import {SingleValue, SingleValueVisualizer,} from "@hisptz/dhis2-analytics";
import dynamic from "next/dynamic";
import { Loader } from '@mantine/core';


export interface BannerProps {
	title: string;
	items: SingleValue[];
}

const NoSSRSingleValue = dynamic(
	() =>
		import("@hisptz/dhis2-analytics").then(({ SingleValueVisualizer }) => ({
			default: SingleValueVisualizer,
		})),
	{
		ssr: false,
		loading: () => {
			return (
				<div className="w-full h-full flex items-center justify-center min-h-[400px]">
					<Loader color="blue" />
				</div>
			);
		},
	},
);

export function Banner({ title, items }: BannerProps) {

	return <NoSSRSingleValue title={title} singleValueItems={items} />;
}
