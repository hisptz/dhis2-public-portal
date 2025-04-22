import { createLazyFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createLazyFileRoute("/appearance/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/appearance/"!</div>;
}
