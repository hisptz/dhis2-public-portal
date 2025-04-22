import { createLazyFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createLazyFileRoute("/modules/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/modules/"!</div>;
}
