import { Button, ButtonStrip, colors } from "@dhis2/ui";
import React, { useState } from "react";
import i18n from "@dhis2/d2-i18n";
import { isEmpty } from "lodash";
import { CustomError, ErrorAction } from "./models/custom-error";

export default function ErrorPage({
	error,
	resetErrorBoundary,
}: {
	error: CustomError | Error;
	resetErrorBoundary?: () => void;
}) {
	const [showStack, setShowStack] = useState(false);
	const refinedError =
		error instanceof CustomError ? error : CustomError.fromError(error);
	const Icon = refinedError.icon;

	return (
		<div
			style={{ minHeight: 400 }}
			className="w-full h-full flex flex-col items-center  justify-center gap-2"
		>
			<div className="icon-size-64">
				<Icon color={colors.grey700} />
			</div>
			<h3 className="text-center text-3xl font-bold text-grey700">
				{refinedError.message ?? i18n.t("Something went wrong")}
			</h3>
			<span className="text-grey700 text-[16px]">
				{refinedError.subtext}
			</span>
			{showStack && (
				<div
					style={{
						width: "50%",
						display: "flex",
						justifyContent: "center",
						background: colors.grey200,
						maxWidth: 800,
						padding: 16,
						margin: 8,
						border: `1px solid ${colors.grey400}`,
					}}
				>
					<code style={{ color: colors.red500 }}>{error.stack}</code>
				</div>
			)}

			{!isEmpty(refinedError.actions) ? (
				<ButtonStrip>
					{refinedError.actions?.map((action: ErrorAction) => {
						return (
							<Button
								primary={action.primary}
								key={action.label.toString()}
								onClick={() => action.action()}
							>
								{action.label}
							</Button>
						);
					})}
				</ButtonStrip>
			) : (
				<>
					<ButtonStrip>
						<Button
							onClick={() => {
								if (resetErrorBoundary) {
									resetErrorBoundary();
									return;
								}
								window.location.reload();
							}}
						>
							{i18n.t("Reload")}
						</Button>
						<Button
							onClick={() =>
								setShowStack((prevState) => !prevState)
							}
						>
							{showStack ? "Hide" : "Show"} details
						</Button>
					</ButtonStrip>
				</>
			)}
		</div>
	);
}
