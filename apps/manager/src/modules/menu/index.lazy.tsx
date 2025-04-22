import { createLazyFileRoute } from "@tanstack/react-router";
import React from "react";

export const Route = createLazyFileRoute("/menu/")({
	component: RouteComponent,
});

function RouteComponent() {
	return <div>Hello "/menu/"!</div>;
}
