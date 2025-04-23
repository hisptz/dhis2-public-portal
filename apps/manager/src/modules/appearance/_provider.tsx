import { createFileRoute, Outlet } from "@tanstack/react-router"
import React from "react"
import { AppearanceProvider } from "../../shared/components/AppearancePage/providers/AppearanceProvider";

export const Route = createFileRoute("/appearance/_provider")({
  component: RouteComponent,
})

function RouteComponent() {
  return (
        <AppearanceProvider>
              <Outlet />
        </AppearanceProvider>
        );
}
