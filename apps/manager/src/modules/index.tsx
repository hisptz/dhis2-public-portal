import { createFileRoute } from "@tanstack/react-router";
import React from "react";
import { WelcomePage } from "../shared/components/WelcomePage";

export const Route = createFileRoute("/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <WelcomePage />;
}
