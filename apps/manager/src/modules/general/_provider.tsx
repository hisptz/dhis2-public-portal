import { createFileRoute, Outlet } from "@tanstack/react-router"
import { MetadataProvider } from "../../shared/components/GeneralPage/providers/GeneralProvider";
import React from "react";

export const Route = createFileRoute("/general/_provider")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
        <MetadataProvider>
            <Outlet />
        </MetadataProvider>
        );
}

