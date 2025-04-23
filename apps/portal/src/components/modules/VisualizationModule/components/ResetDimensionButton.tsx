"use client";
import i18n from "@dhis2/d2-i18n";
import { Button } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";

export function ResetDimensionButton() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const hasActiveParams =
		!!searchParams.get("ou") || !!searchParams.get("pe");

	if (!hasActiveParams) {
		return null;
	}

	const onReset = () => {
		const params = new URLSearchParams(searchParams);
		params.delete("ou");
		params.delete("pe");
		router.replace(`?${params.toString()}`);
	};

	return (
		<Button variant={"outlined"} onClick={onReset}>
			{i18n.t("Reset filters")}
		</Button>
	);
}
