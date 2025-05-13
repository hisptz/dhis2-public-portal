import { DisplayItem } from "@packages/shared/schemas";
import { Card } from "@mantine/core";
import { ErrorBoundary } from "react-error-boundary";
import { Suspense } from "react";
import { CardLoading } from "@/components/CardLoading";
import { CardError } from "@/components/CardError";

export function DisplayItemContainer({
	item,
	children,
}: {
	item: DisplayItem;
	children: React.ReactNode;
}) {
	return (
		<Card key={`${'id' in item ? item.id : ''}-card`} className="w-full h-full">
			<ErrorBoundary FallbackComponent={CardError}>
				<Suspense fallback={<CardLoading />}>{children}</Suspense>
			</ErrorBoundary>
		</Card>
	);
}
