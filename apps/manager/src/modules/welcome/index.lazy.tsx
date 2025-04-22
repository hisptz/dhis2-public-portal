import { createLazyFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createLazyFileRoute("/welcome/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/welcome/"!</div>;
}
