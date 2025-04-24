"use client";
import i18n from "@dhis2/d2-i18n";
import { Button } from "@mantine/core";
import { useRouter, useSearchParams } from "next/navigation";
import { TransitionStartFunction } from "react";

export function ResetDimensionButton({
	isPending,
	startTransition,
}: {
	isPending: boolean;
	startTransition: TransitionStartFunction;
}) {
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
		startTransition(() => {
			router.replace(`?${params.toString()}`);
		});
	};

	return (
		<Button disabled={isPending} variant={"subtle"} onClick={onReset}>
			{i18n.t("Reset filters")}
		</Button>
	);
}
