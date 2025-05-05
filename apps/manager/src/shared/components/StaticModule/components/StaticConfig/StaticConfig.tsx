import React, { useEffect } from "react";
import i18n from "@dhis2/d2-i18n";
import { useItemById } from "../../hooks/data";
import { useNavigate, useParams } from "@tanstack/react-router";
import { StaticItemConfig, staticItemSchema } from "@packages/shared/schemas";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FullLoader } from "../../../FullLoader";
import ErrorPage from "../../../ErrorPage/ErrorPage";
import { Button, IconArrowLeft16 } from "@dhis2/ui";
import { PageHeader } from "../../../PageHeader";
import { ItemActions } from "../ItemActions";
import { StaticForm } from "./StaticForm";

export function StaticConfig() {
	const { itemId } = useParams({
		from: "/modules/_provider/$moduleId/_formProvider/edit/static/$itemId/",
	});
	const { item, loading, error } = useItemById(itemId);
	const form = useForm<StaticItemConfig>({
		resolver: zodResolver(staticItemSchema),
		defaultValues: item,
	});
	const navigate = useNavigate({
		from: "/modules/$moduleId/edit/static/$itemId",
	});
	useEffect(() => {
		if (item) {
			form.reset(item);
		}
	}, [item, form.reset, form]);

	if (loading) return <FullLoader />;

	if (error) {
		return (
			<div className="p-4">
				<ErrorPage
					error={error.message || i18n.t("Error loading item")}
				/>
			</div>
		);
	}

	return (
		<FormProvider {...form}>
			<div>
				<Button
					onClick={() => navigate({ to: "/modules/$moduleId/edit" })}
					icon={<IconArrowLeft16 />}
				>
					{i18n.t("Back")}
				</Button>
				<PageHeader
					title={item?.title ?? ""}
					actions={<ItemActions />}
				/>
				<StaticForm />
			</div>
		</FormProvider>
	);
}
