import { createFileRoute, Outlet } from "@tanstack/react-router"
import React from "react"
import { ModulesProvider } from "../../shared/components/ModulesPage/providers/ModulesProvider";

export const Route = createFileRoute("/modules/_provider")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
        <ModulesProvider>
            <Outlet />
        </ModulesProvider>
        );
}
